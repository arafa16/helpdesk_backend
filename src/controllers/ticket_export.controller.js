const {
  ticket: ticketModel,
  location: locationModel,
  area: areaModel,
  ticket_access: ticketAccessModel,
  ticket_category: ticketCategoryModel,
  ticket_trouble_category: ticketTroubleCategoryModel,
  ticket_status: ticketStatusModel,
  ticket_activity: ticketActivityModel,
  user: userModel,
  customer: customerModel,
} = require("../models");
const excelJs = require("exceljs");
const dayjs = require("dayjs");

const export_data = async (req, res) => {
  const { year, area_uuid } = req.query;

  let whereClause = {
    is_active: true,
  };

  if (year) {
    whereClause = {
      ...whereClause,
      year,
    };
  }

  if (area_uuid) {
    const area = await areaModel.findOne({
      where: { uuid: area_uuid },
    });
    if (area) {
      whereClause = {
        ...whereClause,
        area_id: area.id,
      };
    }
  }

  try {
    const ticket = await ticketModel.findAll({
      where: whereClause,
      include: [
        {
          model: ticketActivityModel,
          include: [
            {
              model: ticketStatusModel,
            },
          ],
        },
        { model: customerModel, attributes: ["uuid", "name"] },
        { model: areaModel, attributes: ["uuid", "name"] },
        { model: ticketStatusModel, attributes: ["uuid", "name", "code"] },
        { model: ticketAccessModel, attributes: ["uuid", "name"] },
        { model: ticketCategoryModel, attributes: ["uuid", "name"] },
        { model: ticketTroubleCategoryModel, attributes: ["uuid", "name"] },
        { model: userModel, attributes: ["uuid", "name"], as: "executor" },
        { model: userModel, attributes: ["uuid", "name"], as: "user" },
      ],
    });

    let workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet("data ticket");

    sheet.columns = [
      { header: "NO", key: "NO", width: 25 },
      { header: "AREA", key: "AREA", width: 25 },
      { header: "BULAN", key: "BULAN", width: 25 },
      { header: "PELANGGAN", key: "PELANGGAN", width: 25 },
      { header: "ALAMAT", key: "ALAMAT", width: 25 },
      { header: "NO SPK", key: "NO_SPK", width: 25 },
      { header: "NO JARINGAN", key: "NO_JARINGAN", width: 25 },
      { header: "NO CASE", key: "NO_CASE", width: 25 },
      { header: "TANGGAL", key: "TANGGAL", width: 25 },
      { header: "JAM ADUAN", key: "JAM_ADUAN", width: 25 },
      { header: "JAM TIBA DILOKASI", key: "JAM_TIBA_DILOKASI", width: 25 },
      { header: "DURASI ETA", key: "DURASI_ETA", width: 25 },
      { header: "TANGGAL SELESAI", key: "TANGGAL_SELESAI", width: 25 },
      { header: "JAM SELESAI", key: "JAM_SELESAI", width: 25 },
      { header: "DURASI", key: "DURASI", width: 25 },
      { header: "PENCAPAIAN", key: "PENCAPAIAN", width: 25 },
      { header: "JUSTIFIKASI", key: "JUSTIFIKASI", width: 25 },
      { header: "JENIS GANGGUAN", key: "JENIS_GANGGUAN", width: 25 },
      { header: "STATUS GANGGUAN", key: "STATUS_GANGGUAN", width: 25 },
      { header: "PENYEBAB GANGGUAN", key: "PENYEBAB_GANGGUAN", width: 25 },
      { header: "SOLUSI GANGGUAN", key: "SOLUSI_GANGGUAN", width: 25 },
      { header: "KENDALA", key: "KENDALA", width: 25 },
      { header: "TEKNISI", key: "TEKNISI", width: 25 },
    ];

    ticket.map((data, index) => {
      let durasi = data?.ticket_activities
        ?.reduce((sum, activity) => {
          if (
            activity?.ticket_status?.is_active === true &&
            activity?.start_date &&
            activity?.end_date
          ) {
            const start = dayjs(activity.start_date);
            const end = dayjs(activity.end_date);
            const hours = end.diff(start, "hour", true);
            return sum + hours;
          } else if (
            activity?.ticket_status?.is_active === true &&
            activity?.end_date === null
          ) {
            const start = dayjs(activity.start_date);
            const end = dayjs(Date.now());
            const hours = end.diff(start, "hour", true);
            return sum + hours;
          }
          return sum;
        }, 0)
        .toFixed(2);

      let tiba_dilokasi = data?.ticket_activities.filter(
        (data) => data?.ticket_status?.code === "2"
      );

      let calculate_durasi = tiba_dilokasi
        ?.reduce((sum, activity) => {
          if (activity?.start_date && activity?.end_date) {
            const start = dayjs(activity.start_date);
            const end = dayjs(activity.end_date);
            const minutes = end.diff(start, "minute", true);
            return sum + minutes;
          } else if (activity?.end_date === null) {
            const start = dayjs(activity.start_date);
            const end = dayjs(Date.now());
            const minutes = end.diff(start, "minute", true);
            return sum + minutes;
          }
          return sum;
        }, 0)
        .toFixed(0);

      let tanggal_selesai = data?.ticket_activities.filter(
        (data) => data?.ticket_status?.code === "5"
      );

      // Helper to format hours as "X jam Y menit"
      function formatHourMinute(value) {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }

      sheet.addRow({
        NO: index + 1,
        AREA: data?.area?.name,
        BULAN: dayjs(data?.createdAt).format("MMMM"),
        PELANGGAN: data?.customer?.name,
        ALAMAT: data?.address,
        NO_SPK: data?.spk_number,
        NO_JARINGAN: data?.network_number,
        NO_CASE: data?.case_number,
        TANGGAL:
          data?.createdAt !== null
            ? dayjs(data?.createdAt).format("YYYY-MM-DD")
            : "",
        JAM_ADUAN:
          data?.complaint_time !== null
            ? dayjs(data?.complaint_time).format("HH:mm")
            : "",
        JAM_TIBA_DILOKASI:
          tiba_dilokasi[tiba_dilokasi.length - 1]?.end_date !== null
            ? dayjs(tiba_dilokasi[tiba_dilokasi.length - 1]?.end_date).format(
                "HH:mm"
              )
            : "",
        DURASI_ETA: calculate_durasi
          ? (() => {
              const h = Math.floor(calculate_durasi / 60);
              const m = calculate_durasi % 60;
              return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
            })()
          : "",
        TANGGAL_SELESAI:
          tanggal_selesai[tanggal_selesai.length - 1]?.end_date !== null
            ? dayjs(
                tanggal_selesai[tanggal_selesai.length - 1]?.end_date
              ).format("YYYY-MM-DD")
            : "",
        JAM_SELESAI:
          tanggal_selesai[tanggal_selesai.length - 1]?.end_date !== null
            ? dayjs(
                tanggal_selesai[tanggal_selesai.length - 1]?.end_date
              ).format("HH:mm")
            : "",
        DURASI: durasi ? formatHourMinute(Number(durasi)) : "",
        PENCAPAIAN: durasi >= 6 ? "tidak tercapai" : "tercapai",
        JUSTIFIKASI: data?.justification,
        JENIS_GANGGUAN: data?.ticket_category?.name,
        STATUS_GANGGUAN: data?.ticket_status?.name,
        PENYEBAB_GANGGUAN: data?.rfo,
        SOLUSI_GANGGUAN: data?.solution,
        KENDALA: data?.constraint,
        TEKNISI: data?.executor?.name,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment;filename=" + "data_user.xlsx"
    );

    workbook.xlsx.write(res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      success: false,
      datas: {
        message: error.message,
      },
    });
  }
};

module.exports = {
  export_data,
};
