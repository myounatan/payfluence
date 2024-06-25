import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_ADDRESS = process.env.ACCOUNT_3_ADDRESS || ""

const PayfluenceModule = buildModule("PayfluenceModule", (m) => {

  const payfluence = m.contract("Payfluence", [ADMIN_ADDRESS]);

  return { payfluence };
});

export default PayfluenceModule;
