import { useNavigate } from "react-router-dom";
import { LocType, IdentityLocType } from '@logion/node-api/dist/Types';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { useResponsiveContext } from '../../common/Responsive';

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function VoidLocs(props: Props) {
    const { voidTransactionLocs, voidIdentityLocsByType } = useCommonContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType, identityLocType } = props

    if (voidTransactionLocs === null || voidIdentityLocsByType === null) {
        return null;
    }

    const requests = locType === 'Identity' ? voidIdentityLocsByType[identityLocType!] : voidTransactionLocs[locType];

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: requestAndLoc => <UserIdentityNameCell userIdentity={ requestAndLoc.request.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: requestAndLoc => <Cell content={ requestAndLoc.request.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.request.status } voidLoc={ true } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '140px'
                    }),
                },
                {
                    header: "LOC ID",
                    render: requestAndLoc => <LocIdCell status={ requestAndLoc.request.status } id={ requestAndLoc.request.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.createdOn || null } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Voiding date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.voidInfo?.voidedOn || null } spinner={ true } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: requestAndLoc =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button onClick={ () => navigate(locDetailsPath(requestAndLoc.request.id, props.locType)) }>View</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: width({
                        onSmallScreen: '150px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                }
            ] }
            data={ requests }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
