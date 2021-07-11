const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const BoltrSwap = artifacts.require('BoltrSwap');
const MasterChef = artifacts.require('MasterChef');
const MockKRC20 = artifacts.require('libs/MockKRC20');
const Timelock = artifacts.require('Timelock');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

contract('Timelock', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.BOL = await BoltrSwap.new({ from: alice });
        this.timelock = await Timelock.new(bob, '28800', { from: alice }); //8hours
    });

    it('should not allow non-owner to do operation', async () => {
        await this.BOL.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.BOL.transferOwnership(carol, { from: alice }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.BOL.transferOwnership(carol, { from: bob }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.timelock.queueTransaction(
                this.BOL.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]),
                (await time.latest()).add(time.duration.hours(6)),
                { from: alice },
            ),
            'Timelock::queueTransaction: Call must come from admin.',
        );
    });

    it('should do the timelock thing', async () => {
        await this.BOL.transferOwnership(this.timelock.address, { from: alice });
        const eta = (await time.latest()).add(time.duration.hours(9));
        await this.timelock.queueTransaction(
            this.BOL.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        await time.increase(time.duration.hours(1));
        await expectRevert(
            this.timelock.executeTransaction(
                this.BOL.address, '0', 'transferOwnership(address)',
                encodeParameters(['address'], [carol]), eta, { from: bob },
            ),
            "Timelock::executeTransaction: Transaction hasn't surpassed time lock.",
        );
        await time.increase(time.duration.hours(8));
        await this.timelock.executeTransaction(
            this.BOL.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [carol]), eta, { from: bob },
        );
        assert.equal((await this.BOL.owner()).valueOf(), carol);
    });

    it('should also work with MasterChef', async () => {
        this.lp1 = await MockKRC20.new('LPToken', 'LP', '10000000000', { from: minter });
        this.lp2 = await MockKRC20.new('LPToken', 'LP', '10000000000', { from: minter });
        this.chef = await MasterChef.new(this.BOL.address, '100', '1000', { from: alice });
        await this.BOL.transferOwnership(this.chef.address, { from: alice });
        await this.chef.add('100', this.lp1.address, 50, 10000, true, { from: alice });
        await this.chef.transferOwnership(this.timelock.address, { from: alice });
        await expectRevert(
            this.chef.add('100', this.lp1.address, 50, 10000, true, { from: alice }),
            "revert Ownable: caller is not the owner",
        );

        const eta = (await time.latest()).add(time.duration.hours(9));
        await this.timelock.queueTransaction(
            this.chef.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [minter]), eta, { from: bob },
        );
        // await this.timelock.queueTransaction(
        //     this.chef.address, '0', 'add(uint256,address,bool)',
        //     encodeParameters(['uint256', 'address', 'bool'], ['100', this.lp2.address, false]), eta, { from: bob },
        // );
        await time.increase(time.duration.hours(9));
        await this.timelock.executeTransaction(
            this.chef.address, '0', 'transferOwnership(address)',
            encodeParameters(['address'], [minter]), eta, { from: bob },
        );
        await expectRevert(
            this.chef.add('100', this.lp1.address, 50, 100000, true, { from: alice }),
            "revert Ownable: caller is not the owner",
        );
        await this.chef.add('100', this.lp1.address, 50, 10000, true, { from: minter })
        // await this.timelock.executeTransaction(
        //     this.chef.address, '0', 'add(uint256,address,bool)',
        //     encodeParameters(['uint256', 'address', 'bool'], ['100', this.lp2.address, false]), eta, { from: bob },
        // );
        // assert.equal((await this.chef.poolInfo('0')).valueOf().allocPoint, '200');
        // assert.equal((await this.chef.totalAllocPoint()).valueOf(), '300');
        // assert.equal((await this.chef.poolLength()).valueOf(), '2');
    });
});
