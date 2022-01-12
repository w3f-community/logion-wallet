import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { LocType, IdentityLocType } from '../../logion-chain/Types';
import { responsiveWidth } from '../../common/Responsive';

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function OpenedLocs(props: Props) {
    const { openedLocRequests, openedIdentityLocsByType } = useCommonContext();
    const navigate = useNavigate();

    if (openedLocRequests === null || openedIdentityLocsByType === null) {
        return null;
    }

    const requests = props.locType === 'Transaction' ? openedLocRequests : openedIdentityLocsByType[props.identityLocType!];

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: request => <UserIdentityNameCell userIdentity={ request.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: responsiveWidth({
                        "max-width: 1350px": '100px',
                        default: '140px'
                    }),
                },
                {
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.status } id={ request.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: responsiveWidth({
                        "max-width: 1350px": '100px',
                        default: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: request =>
                        <ActionCell>
                            <ButtonGroup>
                            <Button onClick={ () => navigate(locDetailsPath(request.id, props.locType)) }>Manage LOC</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: responsiveWidth({
                        "max-width: 1350px": '150px',
                        default: '200px'
                    }),
                    align: 'center',
                }
            ] }
            data={ requests.map(requestAndLoc => requestAndLoc.request) }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
