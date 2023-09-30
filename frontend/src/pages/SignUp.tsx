import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

type InputFields = {
  username: string;
  password: string;
  phone: string;
};
export const SignUpPage = () => {
  const { signUp } = useAuth();
  const { register, handleSubmit } = useForm<InputFields>();
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();

  const onSubmit = async (data: InputFields) => {
    console.log("AAA", data);

    try {
      await signUp(data.username, data.password, data.phone);
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError)
        setError(new Error(error.response?.data.error));
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Username"
          type="text"
          {...register("username", { required: true })}
        />
        <input
          placeholder="Phone"
          type="tel"
          {...register("phone", { required: true })}
        />
        <input
          placeholder="Password"
          type="password"
          {...register("password", { required: true })}
        />
        <input type="submit" />
        {!!error && <p>{error.message}</p>}
      </form>

      <Link to={"/sign-in"}>To Login</Link>
    </main>
  );
};
