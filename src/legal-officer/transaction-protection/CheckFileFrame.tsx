import { useEffect, useState } from "react";
import shajs from "sha.js";

import FileSelectorButton from "../../common/FileSelectorButton";
import Icon from "../../common/Icon";
import PolkadotFrame from "../../common/PolkadotFrame";

import CheckFileResult from "./CheckFileResult";

import './CheckFileFrame.css';

interface DocumentHash {
    file: File;
    hash: string;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export interface Props {
    checkHash: (hash: string) => void;
    checkResult: CheckResult;
}

export default function CheckFileFrame(props: Props) {
    const { checkHash } = props;
    const [ file, setFile ] = useState<File | null>(null);
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ hashing, setHashing ] = useState<boolean>(false);

    useEffect(() => {
        if(file !== null
            && (hash === null || hash.file !== file)) {
            setHashing(true);
            (async function() {
                const unknownStream: any = file.stream();
                const reader: ReadableStreamDefaultReader = unknownStream.getReader();
                const hasher = shajs('sha256');
                let chunk: {done: boolean, value?: Buffer} = await reader.read();
                while(!chunk.done) {
                    hasher.update(chunk.value!);
                    chunk = await reader.read();
                }
                const hash = hasher.digest("hex");
                setHash({
                    file,
                    hash: "0x" + hash
                });
                checkHash("0x" + hash);
                setHashing(false);
            })();
        }
    }, [ file, hash, setHash, checkHash ]);

    return (
        <PolkadotFrame
            className="CheckFileFrame"
            title={ <span><Icon icon={{id: "polkadot_doc_check"}} /> Document conformity check tool</span> }
        >
            <p>Upload a document to check its conformity with a confidential document referenced in this LOC. This tool will generate the “hash” - a digital fingerprint - of the submitted document, compare it with all document “hashes” referenced in the LOC above, and will highlight in it the line - if existing - where the related document has been identified. Otherwise, it will mean that the submitted file version is not part of this current transaction LOC.</p>
            <FileSelectorButton
                onFileSelected={ setFile }
                disabled={ hashing }
                buttonText="Upload a document"
                onlyButton={ true }
            />
            {
                props.checkResult !== "NONE" &&
                <CheckFileResult
                    type={ props.checkResult }
                    hash={ hash!.hash }
                />
            }
        </PolkadotFrame>
    )
}
