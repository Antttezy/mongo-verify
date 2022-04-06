import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from 'bn.js'
import { programs } from '@metaplex/js';
import { metadata } from "@metaplex/js/lib/programs";
import { CREATOR } from "./defs";

const {
    metadata: { Metadata },
} = programs;

export interface UserAccount {
    isInitialized: boolean,
    stakeIndex: BN,
    totalEarned: BN,
    totalPaid: BN
}

export async function parseUserAcc(address: PublicKey, connection: Connection): Promise<UserAccount | null> {
    const account = await connection.getAccountInfo(address, 'finalized')

    if (!account || !account.data || account.data.length === 0)
        return null

    const buffer = account.data
    const isInitialized = (buffer[0] & 0b1) === 1;
    const stakeIndex = new BN(buffer.slice(1, 9), "le");
    const totalEarned = new BN(buffer.slice(9, 17), "le");
    const totalPaid = new BN(buffer.slice(17, 25), "le");

    return {
        isInitialized,
        stakeIndex,
        totalEarned,
        totalPaid
    }
}

async function getTokensByOwner(owner: PublicKey, connection: Connection) {
    const tokens = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
    });

    return tokens.value
        .filter((t) => {
            const amount = t.account.data.parsed.info.tokenAmount;
            return amount.decimals === 0 && amount.uiAmount === 1;
        })
        .map((t) => {
            return { pubkey: t.pubkey, mint: t.account.data.parsed.info.mint };
        });
}

async function getNftMetadata(mint: string, connecction: Connection): Promise<metadata.MetadataData | null> {

    try {
        const metadataPDA = await Metadata.getPDA(mint);
        const chainData = (await Metadata.load(connecction, metadataPDA)).data
        return chainData
    }
    catch (e) {
        return null
    }
}

function filterByCreator(data: metadata.MetadataData): boolean {
    if (!data.data.creators)
        return false

    return data.data.creators.some(cr => cr.address === CREATOR.toBase58() && cr.verified)
}

export async function checkStakeEntry(address: PublicKey, connection: Connection): Promise<PublicKey[]> {

    const tokens = await getTokensByOwner(address, connection)
    const mints =
        (await Promise.all(tokens.map(async t => {
            const metadata = await getNftMetadata(t.mint, connection)
            return {
                token: t,
                metadata
            }
        })))
            .filter(t => t.metadata !== null && filterByCreator(t.metadata))
            .map(t => new PublicKey(t.token.mint))

    return mints
}