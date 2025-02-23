import { AxiosInstance } from "axios";
import { LegalOfficerCase } from "@logion/node-api/dist/Types";

import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../common/Table";
import StatusCell from "../common/StatusCell";
import LegalOfficerName from "../common/LegalOfficerNameCell";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import { POLKADOT } from "../common/ColorTheme";
import { Child } from "../common/types/Helpers";
import ViewFileButton from "../common/ViewFileButton";
import Icon from "../common/Icon";
import { useResponsiveContext } from "../common/Responsive";
import SubmitterName from "../common/SubmitterName";
import { useLogionChain } from "../logion-chain";

import { getFile } from "./Model";
import { LocItem, Viewer } from "./types";
import LocLinkDetails from "./LocLinkDetails";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import LocPublicDataDetails from "./LocPublicDataDetails";
import { useLocContext } from "./LocContext";

import './LocItems.css';

export interface Props {
    matchedHash?: string;
    viewer: Viewer;
}

export default function LocItems(props: Props) {
    const { accounts } = useLogionChain();
    const { locId, loc, locItems, deleteMetadata, deleteLink, deleteFile, locRequest } = useLocContext();
    const { width } = useResponsiveContext();

    function renderDetails(locItem: LocItem): Child {
        return (
            <>
                { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } label={ locItem.name } /> }
                { locItem.type === 'Document' && <LocPrivateFileDetails item={ locItem } /> }
                { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } /> }
            </>
        )
    }

    interface DeleteButtonProps {
        locItem:LocItem
        action: (locItem:LocItem) => void
    }

    function DeleteButton(props: DeleteButtonProps) {
        const { locItem, action } = props
        return (
            <Button
                variant="danger-flat"
                onClick={ () => action(locItem) }
                data-testid={ `remove-${ locItem.type }-${ locItem.name }` }
            >
                <Icon icon={{id: 'trash'}} />
            </Button>
        );
    }

    function renderActions(locItem: LocItem): Child {

        return (
            <ActionCell>
                { locItem.type === 'Data' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && <LocPublishPublicDataButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, loc) && <DeleteButton locItem={ locItem } action={ deleteMetadata! } /> }
                </ButtonGroup> }
                { locItem.type === 'Linked LOC' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && <LocPublishLinkButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, loc) && <DeleteButton locItem={ locItem } action={ deleteLink! } /> }
                </ButtonGroup> }
                { locItem.type === 'Document' && <ButtonGroup>
                    { props.viewer === 'LegalOfficer' && <LocPublishPrivateFileButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, loc) && <DeleteButton locItem={ locItem } action={ deleteFile! } /> }
                </ButtonGroup> }
            </ActionCell>)
    }

    if(locItems.length <= 0 && !loc?.closed) {
        return (
            <div className="LocItems empty-loc">
                <img alt="empty loc" src={ process.env.PUBLIC_URL + "/assets/empty-loc.svg" } />
                <p className="primary">This LOC is empty.</p>
                <p className="secondary">You can add public data and/or confidential documents.</p>
            </div>
        );
    } else {
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ [
                        {
                            header: "Name",
                            render: locItem => <Cell content={ locItem.name } />,
                            renderDetails: locItem => renderDetails(locItem),
                            detailsExpanded: locItem => locItem.newItem,
                            align: "left",
                            width: width({
                                onSmallScreen: '150px',
                                otherwise: '250px'
                            }),
                        },
                        {
                            header: "Timestamp",
                            render: locItem => <DateTimeCell
                                dateTime={ locItem.timestamp }
                                spinner={ locItem.status === 'PUBLISHED' } />,
                                width: width({
                                    onSmallScreen: '100px',
                                    otherwise: '200px'
                                }),
                        },
                        {
                            header: "Type",
                            render: locItem => <Cell content={
                            <>
                                <span className="item-type">{ locItem.type }</span> {
                                    locItem.type === 'Document' &&
                                    <ViewFileButton
                                        nodeOwner={ loc!.owner }
                                        fileName={ locItem.name }
                                        downloader={ (axios: AxiosInstance) => getFile(axios, {
                                            locId: locId.toString(),
                                            hash: locItem.value
                                        }) }
                                    />
                                }
                            </> } />,
                            width: width({
                                onSmallScreen: '145px',
                                otherwise: '160px'
                            }),
                            align: "left"
                        },
                        {
                            header: "Submitted by",
                            render: locItem =>
                                <>
                                    { locItem.submitter === loc?.owner ?
                                        <LegalOfficerName address={ locItem.submitter } /> :
                                        <SubmitterName identity={ locRequest?.userIdentity }/>
                                    }
                                </>
                        },
                        {
                            header: "",
                            render: locItem => {
                                if (locItem.status === 'DRAFT') {
                                    return renderActions(locItem)
                                } else {
                                    return (<StatusCell icon={{ id: 'published' }} text="Published" color={ POLKADOT } />)
                                }
                            },
                            width: width({
                                onSmallScreen: props.viewer === "LegalOfficer" ? '345px' : '145px',
                                otherwise: '400px'
                            }),
                        }
                    ] }
                    renderEmpty={ () => <EmptyTableMessage>No public data nor private documents</EmptyTableMessage> }
                    rowStyle={ (item, index?) => (item.type === "Document" && item.value === props.matchedHash) ? "matched" : "" }
                />
            </div>
        );
    }
}

function canDelete(address: string | undefined, item: LocItem, loc: LegalOfficerCase | null): boolean {
    if(!address) {
        return false;
    }

    if(item.type === "Linked LOC") {
        return address === loc?.owner;
    } else {
        return address === loc?.owner || address === item.submitter;
    }
}
