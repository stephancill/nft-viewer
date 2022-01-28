import { ethers } from "hardhat"
import { Directory, Directory__factory } from "../types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"

describe("Directory", function () {
  let signers: SignerWithAddress[]
  let directory: Directory

  beforeEach(async function () {
    signers = await ethers.getSigners()
    const directoryFactory = new Directory__factory(signers[0])
    directory = await directoryFactory.deploy()
    await directory.deployed()
  })

  it("should set and retrieve correct content hash for account", async function () {
    const contentURI = "ipfs://bafybeicnzgdsfgsytddeibvvw7ha7t72jknzfjdlawf6e5xntal7p6u3je"
    await directory.connect(signers[0]).setList(contentURI)
    let uri = await directory.listURIs(signers[0].address)
    expect(uri).to.equal(contentURI)
  })

  it("should retrieve an empty string for new account", async function() {
    let uri = await directory.listURIs(signers[1].address)
    expect(uri).to.be.empty
  })
})
