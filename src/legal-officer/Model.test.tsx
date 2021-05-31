jest.mock("axios");

import {
    FetchRequestSpecification,
    fetchRequests,
    rejectRequest,
    DEFAULT_LEGAL_OFFICER,
    acceptRequest,
    setAssetDescription
} from './Model';
import { mockPut, mockPost } from "axios";
import moment from 'moment';

test("Fetches pending requests", async () => {
    const specification: FetchRequestSpecification = {
        legalOfficerAddress: DEFAULT_LEGAL_OFFICER,
        status: "PENDING",
    };
    mockPut("/api/token-request", {
        requests: [{}, {}]
    });

    const result = await fetchRequests(specification);

    expect(result.length).toBe(2);
});

test("Rejects one as expected", async () => {
    const rejectCallback = jest.fn();
    const signature = "signature";
    const legalOfficerAddress = "legalOfficerAddress";
    mockPost("/api/token-request/1/reject", { signature, legalOfficerAddress }, rejectCallback);
    await rejectRequest({
        requestId: "1",
        signature,
        rejectReason: "",
        signedOn: moment()
    });
    expect(rejectCallback).toBeCalled();
});

test("Accepts one as expected", async () => {
    const acceptCallback = jest.fn();
    const signature = "signature";
    const legalOfficerAddress = "legalOfficerAddress";
    mockPost("/api/token-request/1/accept", { signature, legalOfficerAddress }, acceptCallback);
    await acceptRequest({
        requestId: "1",
        signature,
        signedOn: moment()
    });
    expect(acceptCallback).toBeCalled();
});

test("Sets asset description as expected", async () => {
    const callback = jest.fn();
    const description = {
        assetId: "assetId",
        decimals: 18
    };
    const sessionToken = "token";
    mockPost("/api/token-request/1/asset", { description, sessionToken }, callback);
    await setAssetDescription({
        requestId: "1",
        description,
        sessionToken
    });
    expect(callback).toBeCalled();
});
