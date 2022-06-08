import * as anchor from '@project-serum/anchor'
import { Program, Spl } from '@project-serum/anchor'
import { FirstApp } from '../target/types/first_app'
import { initializeMint, initializeAccount } from './pretest'

describe('first-app', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)

  // program
  const program = anchor.workspace.FirstApp as Program<FirstApp>
  const splProgram = Spl.token()

  // Context
  const candidate = new anchor.web3.Keypair()
  let treasurer: anchor.web3.PublicKey
  const mint = new anchor.web3.Keypair()
  let candidateTokenAccount: anchor.web3.PublicKey

  let walletTokenAccount: anchor.web3.PublicKey
  let ballot: anchor.web3.PublicKey

  before(async () => {
    // init a mint
    await initializeMint(9, mint, provider)
    // Derive treasurer account
    const [treasurerPublicKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), candidate.publicKey.toBuffer()],
      program.programId
    )

    treasurer = treasurerPublicKey

    const [ballotPublicKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('ballot'), candidate.publicKey.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    )
    ballot = ballotPublicKey

    // derive token account
    walletTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: provider.wallet.publicKey,
    })

    candidateTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: treasurerPublicKey,
    })

    // create token account + mint token
    await initializeAccount(walletTokenAccount, mint.publicKey, provider.wallet.publicKey, provider)
    await splProgram.rpc.mintTo(new anchor.BN(1_000_000_000_000), {
      accounts: {
        mint: mint.publicKey,
        to: walletTokenAccount,
        authority: provider.wallet.publicKey,
      },
    })
  })

  it('init candidate', async () => {
    const now = Math.floor(new Date().getTime() / 1000)
    const startTime = new anchor.BN(now)
    const endTime = new anchor.BN(now + 20)

    await program.rpc.initializeCandidate(startTime, endTime, {
      accounts: {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer: treasurer,
        mint: mint.publicKey,
        candidateTokenAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [candidate],
    })
  })

  it('it vote', async () => {
    await program.rpc.vote(new anchor.BN(1), {
      accounts: {
        authority: provider.wallet.publicKey,
        candidate: candidate.publicKey,
        treasurer,
        mint: mint.publicKey,
        candidateTokenAccount,
        ballot,
        voterTokenAccount: walletTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    })
  })

  it('close', async () => {
    setTimeout(async () => {
      await program.rpc.close({
        accounts: {
          authority: provider.wallet.publicKey,
          candidate: candidate.publicKey,
          treasurer,
          mint: mint.publicKey,
          candidateAccountToken: candidateTokenAccount,
          ballot,
          voterTokenAccount: walletTokenAccount,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      })
    }, 20000)
  })
})
