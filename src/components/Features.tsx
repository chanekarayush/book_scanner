
export default function Features() {
    var featuresList = ["Barcode Scanning", "Library Organization", "Price Comparison"]

    return (
        <section className="Features">
            <ul>
                {featuresList.map(feature =>
                    <li key={feature}>{feature}</li>)}
            </ul>
        </section>
    );
}
