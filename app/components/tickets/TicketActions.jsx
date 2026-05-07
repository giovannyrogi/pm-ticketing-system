"use client";

import FixedBottomActions from "@/app/components/drawer/FixedBottomActions";

const TicketActions = ({
  data,
  user,
  handleAccept,
  setOpenModal,
  handleOpenCompleteModal,
  handleOpenPublishModal,
}) => {
  /**
   * =========================
   * ROLE
   * =========================
   */
  const isAdmin = ["admin", "superadmin"].includes(user?.user?.role);

  /**
   * =========================
   * ASSIGNED ADMIN
   * =========================
   */
  const isAssignedAdmin = Number(user?.user?.id) === Number(data?.admin?.id);

  /**
   * =========================
   * ACTIONS
   * =========================
   */
  let actions = [];

  /**
   * =========================
   * STATUS: PENDING
   * =========================
   */
  if (data?.status === "pending" && isAdmin) {
    actions = [
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
    ];
  }

  /**
   * =========================
   * STATUS: PROSES
   * =========================
   */
  if (data?.status === "proses" && isAdmin && isAssignedAdmin) {
    actions = [
      {
        label: "Selesaikan Laporan",
        color: "success",
        variant: "contained",
        onClick: () => handleOpenCompleteModal(),
      },
    ];
  }

  /**
   * =========================
   * STATUS: SELESAI
   * =========================
   */
  if (
    data?.status === "selesai" &&
    isAdmin &&
    isAssignedAdmin &&
    !data?.is_public
  ) {
    actions = [
      {
        label: "Publish",
        color: "primary",
        variant: "contained",
        onClick: () => handleOpenPublishModal(),
      },
    ];
  }

  /**
   * =========================
   * HIDE ACTION AFTER PUBLISH
   * =========================
   */
  const shouldShowActions = actions.length > 0 && !data?.is_public;

  return <FixedBottomActions show={shouldShowActions} actions={actions} />;
};

export default TicketActions;
