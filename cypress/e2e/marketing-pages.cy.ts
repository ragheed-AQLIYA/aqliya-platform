describe("Marketing Pages - Arabic Content", () => {
  const pages = [
    { path: "/", title: "AQLIYA" },
    { path: "/about", title: "عن" },
    { path: "/products", title: "منتجات" },
    { path: "/how-we-work", title: "منهجية" },
    { path: "/contact", title: "اتصل" },
    { path: "/auditos", title: "AuditOS" },
  ];

  pages.forEach(({ path, title }) => {
    it(`should load ${path} with Arabic content`, () => {
      cy.visit(path);
      cy.get("html").should("have.attr", "dir", "rtl");
      cy.contains(title);
    });
  });

  it("should have RTL direction on all pages", () => {
    cy.document().its("documentElement.lang").should("eq", "ar");
  });
});
