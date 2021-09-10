import { shallowRender } from '../tests';

import Dashboard, { ContentPane, FullWidthPane } from './Dashboard';
import Accounts from './types/Accounts';

const ADDRESSES: Accounts = {
    current: {
        name: "Name 1",
        address: "address1",
        isLegalOfficer: false,
    },
    accounts: [
        {
            name: "Name 1",
            address: "address1",
            isLegalOfficer: false,
        },
        {
            name: "Name 2",
            address: "address2",
            isLegalOfficer: false,
        }
    ]
}

test("renders Dashboard", () => {
    const result = shallowRender(
        <Dashboard
            menuTop={ [] }
            menuBottom={ [] }
            menuMiddle={ [] }
        >
        </Dashboard>
    );
    expect(result).toMatchSnapshot();
});

test("renders ContentPane", () => {
    const result = shallowRender(
        <ContentPane
            primaryAreaChildren={ null }
            secondaryAreaChildren={ null }
            mainTitle=""
            titleIcon={{ }}
        />
    );
    expect(result).toMatchSnapshot();
});

test("renders FullWidthPane", () => {
    const result = shallowRender(
        <FullWidthPane
            mainTitle=""
            titleIcon={{ }}
        >
        </FullWidthPane>
    );
    expect(result).toMatchSnapshot();
});
