import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';

export default function OpenedLocs() {
    const { openedLocRequests } = useCommonContext();

    if(openedLocRequests === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: request => <Cell content={ request.requesterAddress } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.status } id={ request.id }/>,
                    align: "left",
                },
                {
                    "header": "Creation date",
                    render: request => <DateCell dateTime={ request.createdOn || null } />,
                    align: 'left',
                    width: '200px',
                },
            ]}
            data={ openedLocRequests }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
