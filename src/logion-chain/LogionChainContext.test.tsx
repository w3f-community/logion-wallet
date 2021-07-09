jest.mock('@polkadot/api');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/extension-dapp');

import { useLogionChain, LogionChainContextProvider, forceKeyringLoad } from './LogionChainContext';
import { render, waitFor, RenderResult } from '@testing-library/react';
import { ConfigType, DEFAULT_CONFIG } from '../config';

import {
    connectedAndReady,
    triggerEvent,
    eventsCallback,
    newHeadsCallback,
    teardown as teardownApi,
    mockVec,
    mockCompact,
} from '../__mocks__/PolkadotApiMock';
import { updateInjectedAccounts, teardown as teardownExtensionDapp } from '../__mocks__/PolkadotExtensionDappMock';

import { loadAllFails, teardown as teardownKeyring } from '../__mocks__/PolkadotUiKeyringMock';

afterEach(() => {
    teardownApi();
    teardownExtensionDapp();
    teardownKeyring();
    forceKeyringLoad();
});

test('Context automatically connects to first available node', async () => {
    const result = render(<InspectorInContext/>);
    expect(result.getByTestId("apiState")).toHaveTextContent("CONNECT_INIT");
    connectedAndReady();
    await waitFor(() => expectConnectedAndReadyState(result));
});

function InspectorInContext() {
    const config: ConfigType = {
        ...DEFAULT_CONFIG,
        availableNodes: [
            {
                name: "name",
                socket: "address",
                peerId: "peerId"
            }
        ]
    };
    return (
        <LogionChainContextProvider config={config}>
            <LogionContextInspector />
        </LogionChainContextProvider>
    );
}

function LogionContextInspector() {
    const {
        apiState,
        connectedNodeMetadata,
        lastHeader,
        events,
        selectedNode,
        injectedAccounts,
        injectedAccountsConsumptionState,
        eventsConsumption
    } = useLogionChain();
    return (
        <div>
            <p data-testid="apiState">{apiState}</p>
            <p data-testid="selectedNode.name">{selectedNode ? selectedNode.name : ""}</p>
            <p data-testid="selectedNode.socket">{selectedNode ? selectedNode.socket : ""}</p>
            <p data-testid="selectedNode.peerId">{selectedNode ? selectedNode.peerId : ""}</p>
            <p data-testid="connectedNodeMetadata.name">{connectedNodeMetadata ? connectedNodeMetadata.name : ""}</p>
            <p data-testid="connectedNodeMetadata.peerId">{connectedNodeMetadata ? connectedNodeMetadata.peerId : ""}</p>
            <p data-testid="injectedAccountsConsumptionState">{injectedAccountsConsumptionState}</p>
            <p data-testid="injectedAccounts.length">{injectedAccounts !== null ? injectedAccounts.length : -1}</p>
            <p data-testid="eventsConsumption">{eventsConsumption}</p>
            <p data-testid="events.length">{events.length}</p>
            <p data-testid="lastHeader.number">{lastHeader ? lastHeader.number.toNumber() : ""}</p>
        </div>
    );
}

function expectConnectedAndReadyState(result: RenderResult) {
    expect(result.getByTestId("apiState")).toHaveTextContent("READY");
    expect(result.getByTestId("selectedNode.name")).toHaveTextContent("name");
    expect(result.getByTestId("selectedNode.socket")).toHaveTextContent("address");
    expect(result.getByTestId("selectedNode.peerId")).toHaveTextContent("peerId");
    expect(result.getByTestId("connectedNodeMetadata.name")).toHaveTextContent("Mock node");
    expect(result.getByTestId("connectedNodeMetadata.peerId")).toHaveTextContent("Mock peer ID");
    expect(result.getByTestId("eventsConsumption")).toHaveTextContent('STARTED');
}

test('Context automatically connects to first available node with ready event', async () => {
    const result = render(<InspectorInContext/>);
    triggerEvent("connected");
    triggerEvent("ready");
    await waitFor(() => expectConnectedAndReadyState(result));
});

test("Context does not fail with throwing keyring.loadAll", async () => {
    loadAllFails(true);
    const result = render(<InspectorInContext/>);
    expect(result.getByTestId("apiState")).toHaveTextContent("CONNECT_INIT");
});

test('Context detects connection errors', async () => {
    const result = render(<InspectorInContext/>);
    triggerEvent("error");
    await waitFor(() => expect(result.getByTestId("apiState")).toHaveTextContent("ERROR"));
});

test("Context automatically listens to injected accounts", async () => {
    let result = render(<InspectorInContext/>);
    await waitFor(() => expect(result.getByTestId("injectedAccountsConsumptionState")).toHaveTextContent("STARTED"));
});

test("Context detects injected accounts update", async () => {
    let result = render(<InspectorInContext/>);
    const accounts = [{}, {}, {}];
    await waitFor(() => updateInjectedAccounts(accounts));
    await waitFor(() => expect(result.getByTestId("injectedAccounts.length")).toHaveTextContent(accounts.length.toString()));
});

test("Context stores at most 1024 events", async () => {
    const result = render(<InspectorInContext/>);
    connectedAndReady();
    await waitFor(() => expect(result.getByTestId("apiState")).toHaveTextContent("READY"));
    eventsCallback(mockVec(new Array(2000)));
    await waitFor(() => expect(result.getByTestId("events.length")).toHaveTextContent('1024'));
});

test("Context listens to new heads", async () => {
    const result = render(<InspectorInContext/>);
    connectedAndReady();
    await waitFor(() => expect(result.getByTestId("apiState")).toHaveTextContent("READY"));
    newHeadsCallback({number: mockCompact(42)});
    await waitFor(() => expect(result.getByTestId("lastHeader.number")).toHaveTextContent('42'));
});
