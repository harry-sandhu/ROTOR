import Link from "next/link";

const pages = [
  { href: "/builder", title: "Builder", description: "Guided compatibility-first drone builder." },
  { href: "/products", title: "Products", description: "Catalog, search, and product compatibility views." },
  { href: "/builds", title: "Builds", description: "Saved, duplicated, and shared drone builds." },
  { href: "/admin", title: "Admin", description: "Catalog, specification, and rule management." },
  { href: "/auth", title: "Auth", description: "User registration, login, and account entry points." },
];

export default function HomePage() {
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <section>
        <h1 style={{ marginTop: 0 }}>Rotor MVP scaffold</h1>
        <p>
          Rotor is a compatibility-first drone building platform focused on helping users assemble valid
          builds with confidence.
        </p>
      </section>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {pages.map((page) => (
          <Link key={page.href} href={page.href}>
            <section style={{ height: "100%" }}>
              <h2 style={{ marginTop: 0 }}>{page.title}</h2>
              <p style={{ marginBottom: 0 }}>{page.description}</p>
            </section>
          </Link>
        ))}
      </div>
    </div>
  );
}
