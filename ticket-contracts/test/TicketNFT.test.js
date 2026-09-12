const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

async function expectRevert(promise, messageFragment) {
  try {
    await promise;
    assert.fail("Expected transaction to revert");
  } catch (error) {
    if (error.code === "ERR_ASSERTION") throw error;
    if (messageFragment) {
      assert.match(String(error), new RegExp(messageFragment));
    }
  }
}

describe("TicketNFT", function () {
  async function deployFixture() {
    const [organizer, customer, buyer] = await ethers.getSigners();
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const contract = await TicketNFT.deploy(
      "Ticketchain Ticket",
      "TICKET",
      organizer.address
    );
    await contract.waitForDeployment();

    await contract.mintTicket(customer.address, "ipfs://ticket-0", 100n);
    return { contract, organizer, customer, buyer };
  }

  it("allows only the organizer to validate a ticket", async function () {
    const { contract, customer } = await deployFixture();
    await expectRevert(
      contract.connect(customer).validateTicket(0),
      "OwnableUnauthorizedAccount"
    );
    assert.equal(await contract.usedTickets(0), false);
  });

  it("marks a validated ticket as used", async function () {
    const { contract, organizer } = await deployFixture();
    await contract.connect(organizer).validateTicket(0);
    assert.equal(await contract.usedTickets(0), true);
  });

  it("rejects repeated validation", async function () {
    const { contract, organizer } = await deployFixture();
    await contract.connect(organizer).validateTicket(0);
    await expectRevert(
      contract.connect(organizer).validateTicket(0),
      "Ticket already used"
    );
  });

  it("prevents resale after validation", async function () {
    const { contract, organizer, customer, buyer } = await deployFixture();
    await contract.connect(organizer).validateTicket(0);
    await expectRevert(
      contract.connect(customer).resellTicket(0, buyer.address, 50n),
      "Used tickets cannot be resold"
    );
  });
});
