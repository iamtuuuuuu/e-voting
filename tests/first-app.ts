import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { FirstApp } from "../target/types/first_app";

describe("first-app", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.FirstApp as Program<FirstApp>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
