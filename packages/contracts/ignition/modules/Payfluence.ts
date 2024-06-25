import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ADMIN_ADDRESS = "0x9D1aAdE76e340a6a36c8fa9b920f7494A76bb76a"

const PayfluenceModule = buildModule("PayfluenceModule", (m) => {

  const payfluence = m.contract("Payfluence", [ADMIN_ADDRESS]);

  return { payfluence };
});

export default PayfluenceModule;
