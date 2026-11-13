import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("./services/authsservice", () => ({
  getAuthToken: () => null,
  signout: vi.fn(),
}));

import App from "./App.jsx";

describe("home page", () => {
  it("renders the notes heading and create-note actions", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(markup).toContain("Your notes");
    expect(markup).toContain("New note");
    expect(markup).toContain("Create New Note");
  });
});
