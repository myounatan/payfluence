import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    sepolia: {
      url: process.env.ALCHEMY_BASE_SEPOLIA,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY || '',
        process.env.ACCOUNT_3_PRIVATE_KEY || '',
        process.env.ACCOUNT_4_PRIVATE_KEY || '',
      ],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      'sepolia': `${process.env.BASESCAN_KEY}`
    },
    customChains: [
      {
        network: 'sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org'
        }
      }
    ]
  }
};

export default config;
