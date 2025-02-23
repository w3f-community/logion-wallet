import { UUID } from "@logion/node-api/dist/UUID";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import { render } from "../tests"

import ContextualizedLocDetails from "./ContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { Viewer } from "./types";
import { setLoc, setLocId, setLocRequest } from "./__mocks__/LocContextMock";

jest.mock('../common/CommonContext');
jest.mock('./LocContext');
jest.mock('react-router');
jest.mock('../logion-chain');

describe("ContextualizedLocDetails", () => {
    it("renders for LO", () => rendersForViewer("LegalOfficer"))
    it("renders for wallet user", () => rendersForViewer("User"))
})

function rendersForViewer(viewer: Viewer) {
    const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
    setLocId(uuid);
    setLoc(OPEN_IDENTITY_LOC);
    setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
    const tree = render(<ContextualizedLocDetails
        viewer={ viewer }
    />);
    expect(tree).toMatchSnapshot();
}
