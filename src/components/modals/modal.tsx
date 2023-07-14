import React from "react";

interface ModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title: string;
}

const Modal = ({ setShow, show, children, title }: ModalProps) => {
  if (!show) return null;

  return (
    <section className="">
      <div>{children}</div>
    </section>
  );
};

export default Modal;
