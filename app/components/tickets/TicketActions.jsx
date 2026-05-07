"use client";

import FixedBottomActions from "@/app/components/drawer/FixedBottomActions";

const TicketActions = ({ data, user, handleAccept, setOpenModal }) => {
  return (
    <FixedBottomActions
      show={
        data?.status === "pending" &&
        ["admin", "superadmin"].includes(user?.user?.role)
      }
      actions={[
        {
          label: "Tolak Laporan",
          color: "error",
          variant: "outlined",
          onClick: () => {
            setOpenModal(true);
          },
        },

        {
          label: "Terima Laporan",
          color: "primary",
          variant: "contained",
          onClick: () => handleAccept(),
        },
      ]}
    />
  );
};

export default TicketActions;