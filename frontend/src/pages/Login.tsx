import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

type InputFields = {
  username: string;
  password: string;
};
export const LoginPage = () => {
  const { signIn } = useAuth();
  const { register, handleSubmit } = useForm<InputFields>();
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();

  const onSubmit = async (data: InputFields) => {
    console.log("AAA", data);

    try {
      await signIn(data.username, data.password);
      navigate("/");
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
          placeholder="Password"
          type="password"
          {...register("password", { required: true })}
        />
        <input type="submit" />
        {!!error && <p>{error.message}</p>}
      </form>

      <Link to={"/sign-up"}>To REGISTER</Link>
    </main>
  );
};
