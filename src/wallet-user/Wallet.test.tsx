jest.mock("../logion-chain");

import React from "react";
import { mockAccount, shallowRender } from "../tests";
import { setContextMock } from '../logion-chain/__mocks__/LogionChainMock';
import Wallet from "./Wallet";

test("renders", () => {
    setContextMock({
        injectedAccounts: [
            mockAccount("address", "name")
        ]
    })
    const tree = shallowRender(<Wallet/>)
    expect(tree).toMatchSnapshot();
});
