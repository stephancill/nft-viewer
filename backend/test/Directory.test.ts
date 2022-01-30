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
    directory = await directoryFactory.deploy(false)
    await directory.deployed()
  })

  it("should set and retrieve correct content hash for account", async function () {
    const contentURI = "ipfs://bafybeicnzgdsfgsytddeibvvw7ha7t72jknzfjdlawf6e5xntal7p6u3je"
    await directory.connect(signers[0]).setListForAddress(signers[0].address, contentURI)
    let uri = await directory.listURIs(signers[0].address)
    expect(uri).to.equal(contentURI)
  })

  it("should retrieve an empty string for new account", async function() {
    let uri = await directory.listURIs(signers[1].address)
    expect(uri).to.be.empty
  })

  it("should fail to set list for other account when closed", async function() {
    const [signer, otherSigner] = signers
    const contentURI = "ipfs://bafybeicnzgdsfgsytddeibvvw7ha7t72jknzfjdlawf6e5xntal7p6u3je"
    expect(directory.connect(signer).setListForAddress(otherSigner.address, contentURI)).to.be.revertedWith("Contract is not open")
  })

  it("should set and retrieve correct content hash for other account when open", async function () {
    // Deploy open directory
    const directoryFactory = new Directory__factory(signers[0])
    directory = await directoryFactory.deploy(true)
    await directory.deployed()

    const [signer, otherSigner] = signers
    const contentURI = "ipfs://bafybeicnzgdsfgsytddeibvvw7ha7t72jknzfjdlawf6e5xntal7p6u3je"
    await directory.connect(signer).setListForAddress(otherSigner.address, contentURI)
    let uri = await directory.listURIs(otherSigner.address)
    expect(uri).to.equal(contentURI)
  })
})
