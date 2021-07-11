const { assert } = require("chai");

const BoltrSwap = artifacts.require('BoltrSwap');

contract('BoltrSwap', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.cake = await BoltrSwap.new({ from: minter });
    });


    it('mint', async () => {
        await this.cake.mint(alice, 1000, { from: minter });
        assert.equal((await this.cake.balanceOf(alice)).toString(), '1000');
    })
});