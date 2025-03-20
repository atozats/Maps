import axios from "axios";

 const sendsms = async (PHONE, OTP) => {


  const API = "936824c0191953647ec609b4f49bc964";
  const URL = `https://sms.renflair.in/V1.php?API=${API}&PHONE=${PHONE}&OTP=${OTP}`;

  await axios.get(URL)
    .then(response => {
      const data = response.data;
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

export default sendsms;
