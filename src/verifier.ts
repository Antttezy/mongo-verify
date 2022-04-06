import { Connection, PublicKey } from "@solana/web3.js";
import { checkStakeEntry, parseUserAcc } from "./dataUtil";
import { getStakeEntryPDA, getUserAccPDA } from "./pdaUtil";
import BN from 'bn.js'

export async function verifyHolder(address: PublicKey, mint: PublicKey, connecction: Connection): Promise<boolean> {

    const accAddr = await getUserAccPDA(address)
    const acc = await parseUserAcc(accAddr, connecction)

    if (!acc)
        return false

    const stakeIndex = acc.stakeIndex

    for (let i = new BN(0); i.lt(stakeIndex); i = i.add(new BN(1))) {
        const entryAddr = await getStakeEntryPDA(address, i)

        const mints = await checkStakeEntry(entryAddr, connecction)

        if (mints.some(m => m.equals(mint)))
            return true
    }

    return false
}