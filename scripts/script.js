// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const owner = signers[0];

  const ERC20_TEST_TOKEN = await hre.ethers.getContractFactory(
    "ERC20_TEST_TOKEN"
  );
  const FlamingPhenixClubNFT = await hre.ethers.getContractFactory(
    "FlamingPhenixClubNFT"
  );

  const token = await ERC20_TEST_TOKEN.deploy(
    "Test Token",
    "TTOK",
    hre.ethers.utils.parseEther("10000000000000")
  );

  await token.deployed();

  const nft = await FlamingPhenixClubNFT.deploy(
    "ipfs://QmSbDoWoSCbtK5Lj1twcqaMotetCHN9YxFnHSbNMNWJWC1/",
    5
  );

  await nft.deployed();

  console.log("FPC deployed to:", nft.address);
  console.log("Token deployed to:", token.address);

  console.log(await nft.ownedNFTIdList(owner.address));
  console.log("Metadata of NFT ID: 1");
  console.log(await nft.tokenURI(1));
  console.log("Revealing NFTs....");
  await nft.setRevealed();
  console.log("Metadata of NFT ID: 1");
  console.log(await nft.tokenURI(1));

  await nft.connect(owner).setMintEnabled(true);
  await nft.connect(owner).setPayableERC20Token(token.address);

  console.log("Signer 1 Balance:");
  console.log(await signers[1].getBalance());

  // signer 1 mint 10
  console.log("Minting 10 NFTs as Signer 1...");
  await nft.connect(signers[1]).mintExternal(10, {
    value: hre.ethers.utils.parseEther("2900").toString(),
  });

  console.log("Signer 1 Balance:");
  console.log(await signers[1].getBalance());
  console.log(await nft.ownedNFTIdList(signers[1].address));

  console.log(await nft.payments("0xcf322B554b6CfB668221D5b1979B6e4E58AB4DbC"));

  await nft.withdrawPayments("0xcf322B554b6CfB668221D5b1979B6e4E58AB4DbC");
  console.log(
    await signers[0].getBalance("0xcf322B554b6CfB668221D5b1979B6e4E58AB4DbC")
  );

  console.log(await nft.payments("0xcf322B554b6CfB668221D5b1979B6e4E58AB4DbC"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
