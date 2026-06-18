
export default function Hero({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <>
            <section className="hero">
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </section>
        </>
    )

}
