import { useRouter } from "next/router";
import Image from "next/image";

const Country = () => {
  const router = useRouter();
  const { countryISO3 } = router.query;
  const flagCode = countryISO3?.toLowerCase();

  console.log("flagCode = ", flagCode);

  return (
    <>
      <p>Country: {countryISO3}</p>
      <Image src={`/flags-big-iso3/${flagCode}.png`} alt={flagCode} width="100" height="64" />
    </>
  );
};

export default Country;
