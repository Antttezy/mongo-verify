import { PublicKey } from "@solana/web3.js";
import { GLOBAL_STATE, PROGRAM_ID } from './defs'
import BN from 'bn.js'

export async function getUserAccPDA(user: PublicKey) {

    const [addr] = await PublicKey.findProgramAddress(
        [
            Buffer.from("staker"),
            GLOBAL_STATE.toBuffer(),
            user.toBuffer()
        ],
        PROGRAM_ID
    )

    return addr;
}

export async function getStakeEntryPDA(user: PublicKey, index: BN): Promise<PublicKey> {
    const userAcc = await getUserAccPDA(user);

    const [addr] = await PublicKey.findProgramAddress(
        [
            Buffer.from("stake_entry"),
            userAcc.toBuffer(),
            index.toArrayLike(Buffer, "le", 8)
        ],
        PROGRAM_ID
    )

    return addr;
}