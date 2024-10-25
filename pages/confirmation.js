// pages/confirmation.js
import { useRouter } from "next/router";

const Confirmation = () => {
  const router = useRouter();
  const { message } = router.query;

  return (
    <div>
      <h1>Confirmation</h1>
      <p>{message}</p>
    </div>
  );
};

export default Confirmation;
