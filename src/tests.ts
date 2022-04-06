import { Connection, PublicKey } from "@solana/web3.js";
import { verifyHolder } from "./verifier";

export async function testHolderTrue() {
    const connection = new Connection("https://api.mainnet-beta.solana.com")

    // Wallet that staked
    const holder = new PublicKey('D1kgow5qHSMukHwD2eFuRJWpyBYE2FMCBC2dwK9S7b6c')

    // Staked NFT
    const mint = new PublicKey('9xqTgwNagqB8i3ew94jhWwkKD2MkwaLdfHJ7qYjZHkqj')

    const ok = await verifyHolder(holder, mint, connection)
    console.log(`Is holder: ${ok} (expected true)`)
}

export async function testHolderFalse() {
    const connection = new Connection("https://api.mainnet-beta.solana.com")

    // Wallet that staked
    const holder = new PublicKey('D1kgow5qHSMukHwD2eFuRJWpyBYE2FMCBC2dwK9S7b6c')

    // NFT, not owned by wallet
    const mint = new PublicKey('66B8qPdJUBcnubfL4QyZuyTmz4FiJSSrcVAFBkfHGp7y')

    const ok = await verifyHolder(holder, mint, connection)
    console.log(`Is holder: ${ok} (expected false)`)
}

testHolderTrue().then(
    () => { },
    (err) => {
        console.error(err)
    }
)

testHolderFalse().then(
    () => { },
    (err) => {
        console.error(err)
    }
)