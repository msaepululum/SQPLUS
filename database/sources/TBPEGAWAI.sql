/*
 Navicat Premium Data Transfer

 Source Server         : DB_PROD_SIMRS
 Source Server Type    : SQL Server
 Source Server Version : 16001000 (16.00.1000)
 Source Host           : 10.0.10.204:1433
 Source Catalog        : Payroll
 Source Schema         : dbo

 Target Server Type    : SQL Server
 Target Server Version : 16001000 (16.00.1000)
 File Encoding         : 65001

 Date: 11/06/2026 20:07:07
*/


-- ----------------------------
-- Table structure for TBPEGAWAI
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[dbo].[TBPEGAWAI]') AND type IN ('U'))
	DROP TABLE [dbo].[TBPEGAWAI]
GO

CREATE TABLE [dbo].[TBPEGAWAI] (
  [ckdpeg] varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [cnmpeg] varchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [ckdbag] varchar(6) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [cnmbag] varchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [cusr_stamp] varchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL
)
GO

ALTER TABLE [dbo].[TBPEGAWAI] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Records of TBPEGAWAI
-- ----------------------------
BEGIN TRANSACTION
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'589', N'WIWIT A NURHANDAYANI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'592', N'MUNAWAR HAKIM', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'593', N'FARIDA LINTANG', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'594', N'ARIF RAHMAN', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'595', N'HERMAWAN', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'598', N'SALOKO SALASANTO', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'599', N'NURYADI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'604', N'NUR INSANI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'606', N'DEWI RUCIANTI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'607', N'ROZALINA DEWI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'608', N'WIDARYANTI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'612', N'LENI IDRIS', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'613', N'SITI NURLAELA', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'614', N'KHAERIYATUN TASRIFAH', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'616', N'ENNY ROHAENI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'618', N'TRI ASTUTI HANDAYANI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'619', N'HENNY KUSRINI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'622', N'PURWATMI W', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'623', N'MURSITI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'625', N'ANDRI AFRIYON', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'627', N'DWI ISMAWATININGSIH', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'628', N'MISWANDI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'632', N'PRIYONO', NULL, N'POS RAWAT JALAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'633', N'SARIP HIDAYATULLAH', NULL, N'KAMAR JENAZAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'634', N'YUNIAR SUSANTI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'635', N'WAHYUNI LESTARI', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'637', N'IIM ABDUROHIM', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'638', N'MARYONO', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'642', N'TRI WIDODO', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'644', N'SRI HANDAYANI', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'647', N'POLTAK PARLUHUTAN BB', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'651', N'TATI NURHAYATI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'660', N'GITO PRASETYO', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'661', N'MOH. NAHDI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'664', N'VITRI KUSUMASTUTI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'665', N'LUSI MEI HERAWATI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'666', N'BAIQ DINA FERDIYANTI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'668', N'TIEN SUHARTINI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'669', N'SRI WAHYUNI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'674', N'SUGIMIN', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'678', N'MUJIONO', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'681', N'SUTRISNO', NULL, N'INFORMASI - OPERATOR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'682', N'SUWITO', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'686', N'NURSINGGIH', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'687', N'DEDI SATRIA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'689', N'DWI ASTUTI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'690', N'RITA PRITASARI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'691', N'AMINAH', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'692', N'IKA ROSTIKA', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'693', N'DIAN ESTIARSIH', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'694', N'DIANA SETIAWATI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'695', N'BABY JUANITA KURNIA SARI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'696', N'DEWI BUDIYANTI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'697', N'SUPARMI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'698', N'ISMAIL JAYUS', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'699', N'IDA SAMSIATI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'702', N'RR.NADYA RIZKI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'705', N'ROHATI SUSANTI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'707', N'DEVITRIA SANDY', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'708', N'IMAS ROSADAH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'711', N'MURTAFIAH', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'712', N'RITA VERONICA', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'713', N'SANTI LALA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'714', N'NURLAYLAH', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'715', N'RETNO TRI HANDAYANI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'716', N'SITI NURBAITI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'717', N'MULA  WARMAN R', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'718', N'SULARJO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'719', N'HARDIANTO', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'720', N'AMRON SURBAKTI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'721', N'KARDI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'722', N'SEPTIK MERIOLA', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'723', N'RUSMALINA', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'725', N'RONAL NOPPERANTO SILALAHI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'726', N'UMMI DIAN KURNIA', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'728', N'FIKALIA MATONGAI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'729', N'AFNIATI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'730', N'OWIK HARIAWAN', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'732', N'SITI AMINAH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'734', N'TIUR MAIDA YULIANA  P.S', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'736', N'MARYATIH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'737', N'TRI WAHYUNINGSIH', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'738', N'DJONSON M HAFIDZ', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'749', N'RURI AKHMAD ABDUL MADJID', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'750', N'SUGIYANI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'752', N'RITA SARI WAHYUNI M', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'754', N'DESSY', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'755', N'ENDANG SARASTUTI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'756', N'MUHAMAD SUBHAN', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'758', N'DWI YULI ERNAWATI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'759', N'SITI NURHAYATI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'760', N'SILVIA DS GONCALVES', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'762', N'MUAMANAH', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'768', N'ADI SUHARTO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'770', N'ALI MUSTOPA', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'790', N'ANDRI AKBAR', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'791', N'LAELA SARI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'793', N'SUTEJO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'794', N'SUTORO', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'795', N'JOHNY RANDY HS', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'796', N'BUDI HARTOKO', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'797', N'MUGFIROH', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'798', N'VERAWATI INDAH DWIHASTUTI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'799', N'ADE DEWI LESTARI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'800', N'FARIDA DEWI NOVIYANTI', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'801', N'DWI ANGGRAINI', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'802', N'LUSYA PUSPITASARI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'803', N'SITI ALFISYIAR', NULL, N'LEGAL SERVICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'804', N'WIDODO HASTIYANTO', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'805', N'DIAN TRI HANDOKO', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'812', N'DWI KENYA', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'813', N'INTAN MARIANI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'814', N'JANUAR ASTUTY', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'815', N'NENG SUCI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'816', N'RITA VERONICA', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'820', N'TUTI ALAWIYAH', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'823', N'WIDODO HERIYANTO', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'826', N'MOHAMMAD ARIEF HIDAYAT', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'827', N'ANTONIUS UNTORO', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'828', N'DWI NANTO', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'830', N'DEWI SUSILOWATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'831', N'DWI MAY YENI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'832', N'SRI WATI MAHA', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'833', N'SRI ANDRIYANI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'834', N'SITI MAEMUNAH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'835', N'TRI HARTINI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'837', N'WINARMI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'840', N'MARIYANI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'841', N'IDHAM', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'843', N'EVI OKTAVIAWATI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'844', N'RELITA DALIMUNTHE', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'845', N'SRI SAYEKTI INDAH W', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'846', N'YOENI MOENANDARI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'851', N'MASAYU SRI YULIANA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'852', N'PIPIT YOHANA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'853', N'TRI LUSIANA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'854', N'JAWI MEGARINI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'855', N'LENI MEINARNI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'856', N'ETIK HERNIAWATI', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'858', N'PUJI LESTARI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'859', N'IRMA AYUNY', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'861', N'FANSA MARTINI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'862', N'NENI ARFIKA', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'863', N'INAYAH MACHRIANA', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'864', N'INDAH AGUSTINA', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'875', N'FITA WAHYUNI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'876', N'AGUNG BUDI WIBOWO', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'877', N'RESWATININGSIH', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'879', N'PANGESTUTI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'880', N'MASTUROH', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'881', N'SITI LAELA SARI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'882', N'SEPTI NURHAYATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'883', N'FITRIAH', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'884', N'AGUNG WIBISONO', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'885', N'MOCH.WAHYU AGUNG HS', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'886', N'SRI PUSTIKANINGRUM', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'887', N'ANI YULIATI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'888', N'MILLA ARYATI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'889', N'VIJRIATI EVRILIANI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'890', N'ULFA DAMAYANTI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'891', N'LANY ARI WAHYUNINGSIH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'893', N'FATIMAH ZAHRA', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'894', N'RAFIDAH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'895', N'YUNI PURWATI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'896', N'NOVITA CHOIRIAH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'899', N'DWI PURYANTI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'901', N'NURAENI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'902', N'RETNO PRAWITASARI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'905', N'WARDA DESIANAH', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'906', N'TRI DEVI ALIF', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'907', N'RISNA WIWIK', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'908', N'IDA YUHAIDA', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'909', N'NURHAYATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'910', N'MEDIAWATI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'911', N'MUSLINAH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'913', N'SUKAMTO', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'914', N'OKTO BRATA', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'2', N'NIMAN', NULL, N'LABORATORIUM(BANK DRH)', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'9', N'AGUS RUSWANTORO', NULL, N'KAMAR JENAZAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'17', N'BACO M NOOR', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'21', N'BARDAN', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'30', N'N.TJITJIH SUNARSIH', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'31', N'DAIM AROHIM', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'36', N'DEDEH SUNARTI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'39', N'HENI HANDAYANI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'40', N'MOHAMMAD TAUFIK, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'45', N'HOLID', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'77', N'ENCIH KURNIASIH', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'96', N'DINI RAHMAWATI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'97', N'HUSIN', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'112', N'JUPRIYANTO', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'121', N'ALKAISAH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'146', N'NAMIN B', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'147', N'NANI SUNDARI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'149', N'NASIHIN', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'151', N'NARWIN', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'152', N'TRI MULYATI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'155', N'SUWIRDANINGSIH', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'157', N'SURANTO ARDIYONO', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'165', N'NURYATI', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'171', N'MAMAT', NULL, N'POLI MATA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'175', N'YUNITA ISWANTINI', NULL, N'POLI THT', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'177', N'M.EFFENDI', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'187', N'RUMSINAH', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'188', N'YATNO', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'195', N'SEDI SASMITA', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'200', N'MULYANA', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'223', N'MULYADI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'249', N'IDA WIDANINGSIH', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'251', N'ASEP NUGRAHA', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'255', N'ROFIQ HIDAYAT', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'259', N'KRESNO ADI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'262', N'CECEP SUHANA', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'265', N'NUNUK HARJANTI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'266', N'SRI SULASTRI', NULL, N'POLI JANTUNG', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'277', N'HARTATI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'283', N'M.M.ASRI PURWANTINI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'297', N'FATMAIDA', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'298', N'SRI SUWARNI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'299', N'RISA DEWI S', NULL, N'SEKRETARIS', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'300', N'SRI MURYATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'302', N'KUSNO WASITO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'325', N'EDY SUSANTO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'330', N'TUTIK ALWIYAH', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'331', N'M.RUSLI', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'332', N'IMAS SOPHALINA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'351', N'OCIM SETIAWAN', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'352', N'SALIMI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'355', N'SETIOBUDI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'357', N'ERNI MIARNI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'358', N'HERRY HERRY SIAHAAN', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'364', N'EMMA KARTIKA', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'367', N'SHINTA WIDYASTUTI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'373', N'WIJI SUPRIYATI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'378', N'NURDIN', NULL, N'LABORATORIUM(BANK DRH)', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'379', N'AFNI ZAHARA', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'381', N'ASEP HERNAWAN', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'383', N'LELLY ANGGRAINY', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'384', N'DONY SETIAWAN', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'391', N'WIJI PRIHATIN', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'392', N'ANI KANIDA', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'393', N'KOESDINAR', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'394', N'LASMA SIANIPAR', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'395', N'NURMALA', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'397', N'TUTI WAHYUNI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'398', N'WIJI UTAMI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'399', N'WIWIK KRISMUNARTI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'403', N'NURI FITRIASTUTI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'405', N'ANY WIJAWATI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'407', N'AHMAD UWES NUGRAHA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'410', N'WINDRIANINGSIH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'412', N'WASIHA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'413', N'MASRUROH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'415', N'WARSILAH', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'416', N'PARSIAH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'417', N'SUWAGE SAPUTRA', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'421', N'LENI FITRIA', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'422', N'RATNA MULIANA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'423', N'SITI MUFLIKHAH', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'424', N'SITI NURMALIA', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'425', N'SRI YUNIARTI T', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'426', N'SANDY SENJAYANI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'428', N'ATI SUMARYATI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'429', N'IKA MASRIATININGSIH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'430', N'ROMLAH ANA SAFITRI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'435', N'DESI HELVRIYANTI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'438', N'SUGENG SANTOSO', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'439', N'SYLVANA RIZAL, dra', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'440', N'SUSILAWATI, dra', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'443', N'SURONO', NULL, N'POLI PENYAKIT DALAM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'444', N'NIRWANI PUJIASTUTI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'447', N'SRI WIDYARTI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'448', N'YUNUS', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'449', N'NOVAL RIDWAN', NULL, N'INFORMASI - OPERATOR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'452', N'IBNU KRISTIANTO', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'453', N'TRI WAHYU PUJIWATI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'459', N'JAMARI IRAWAN', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'461', N'SRI MULYANI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'462', N'NGADINO', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'463', N'LIANA DEWI YULIANTI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'464', N'DEDDY WIJONARKO', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'465', N'FX.KAMSIAR', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'467', N'AGUNG NUR INDRAYANA', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'470', N'HARIO WICAKSONO, SKM', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'471', N'ARI PUTERA NEGARA', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'472', N'INDRIASTUTI, SKM', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'473', N'RINA ARIANI, SKM', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'474', N'SRI MURNI B', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'476', N'AHMAD MUSTAURID', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'477', N'FETRI ANITA', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'479', N'AHMAD MUTHASIL', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'480', N'DYAN ROCHMAWATI', NULL, N'MANAJER MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'481', N'LENA SARI DEWI', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'482', N'LITIZIA RULIANI', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'483', N'KUSUMASTUTI DP', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'484', N'ERA SITIARA', NULL, N'INFORMASI - OPERATOR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'485', N'LIA ROSALIANA', NULL, N'PENGEMBANGAN PRODUK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'486', N'IRMA HERMAWATI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'487', N'SUPARNO', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'494', N'INDRA SIDARTHA', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'495', N'SUSILONINGSIH', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'496', N'GIMANTO', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'499', N'BAMBANG HERWANTO', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'501', N'ANCUS NAINGGOLAN, dr', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'502', N'DESRO RIVANI, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'503', N'MOH. NURSYAHBANI', NULL, N'LABORATORIUM(BANK DRH)', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'504', N'LUKI LUKMANUL HAKIM', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'509', N'UNTUNG SURATNO', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'513', N'DWI RAHAYUNINGSIH', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'515', N'WAWAN SETIAWAN', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'516', N'WIWIN HASTUTI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'517', N'M.FADHLAN H', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'518', N'M.YASIN', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'520', N'S.BAMBANG', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'521', N'SUNI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'522', N'SUNARSIH', NULL, N'POLI PARU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'524', N'ASMAWI', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'525', N'MOHAMAD YANI', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'527', N'YUYUN  NIYATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'528', N'YUNIK', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'529', N'AHMAD BUNYANI', NULL, N'INFORMASI - OPERATOR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'530', N'NURSAID', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'531', N'UNTUNG HARYANTO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'533', N'MULYADI', NULL, N'INFORMASI - FRONT OFFICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'534', N'RIZAL JAMI A', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'536', N'DIDIK INDRIYANTO', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'541', N'M.YUSANTO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'542', N'NUNUNG SUSANTI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'543', N'DEWI ANGGRAINI', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'545', N'RATIH ANGGRAENI R', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'546', N'SUJIYEM', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'549', N'SUGIARTI', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'550', N'YUNI WULANDARI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'551', N'UNTUNG WINANTO', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'554', N'JUWANI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'559', N'MEGAWATI NAPITUPULU', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'561', N'MENIK NURHAYATI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'562', N'TIURMA ELFRIDA', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'563', N'INDRI WAHYUNI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'566', N'HAMBALI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'570', N'YULIKHA', NULL, N'LABORATORIUM- PA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'571', N'MUSLIHAT', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'574', N'LIS RAHMI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'575', N'SUMIYATI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'576', N'LILA MIRYAM PURBA, S.Psi', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'578', N'ERMAN', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'579', N'IDAWATI ROMATIAR', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'580', N'RINI TRI HAPSARI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'581', N'DEPI FITRIA', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'582', N'NENENG KOMARIAH', NULL, N'LABORATORIUM- PA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'584', N'SRI HARTINI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'585', N'ASTUTIK', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'586', N'FAJAR YATININGRUM', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'587', N'ROS GUNANINGSIH', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'917', N'DJAMAL ABDUL M, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'918', N'RINA WULAN S', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'919', N'NIYA LISTIANI N', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'924', N'ENDANG S', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'925', N'TITIK SETIARINI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'927', N'ATIK JUWITA ASIH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'928', N'MUSTIKA SEPTIANA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'929', N'RISKA SILVIANA R', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'931', N'ASRI DESTIANINGSIH', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'933', N'ATIEK YUNINGSIH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'934', N'MERRY K, DR', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'936', N'ISNANI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'937', N'DWI RATIH P', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'938', N'FITRIAS DIAN SURYANI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'939', N'RENY SABRIYANI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'940', N'EKA SITI HANIFACH', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'941', N'LENY PUSPITASARI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'942', N'ANI SURYANI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'944', N'YUNITA', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'945', N'NI PUTU WIRATNINGSIH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'946', N'RANI ANDRIANI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'947', N'ABDURROCHIM', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'948', N'YANTI MAULIYANAWATI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'949', N'DWI SUSILOWATI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'950', N'YAYAH ROKAYAH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'952', N'RENI MORENO', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'953', N'IKA DIYAH RATNAWATI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'954', N'INDI RIANDINI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'955', N'GEMBIRA SITEPU', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'956', N'RINI WIDIASTUTI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'957', N'ERNIK SUSILAWATI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'958', N'NOVINILA KRISNA', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'959', N'LISWANTO PUTRA', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'962', N'SEPTINA NILAFIARI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'963', N'NIKEN WORO SUKESI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'964', N'EVYLEN YUNITA', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'965', N'SITI FATMAH', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'772', N'ANDI MUNADI', NULL, N'KOPERASI', N'Baru : ANDRI A-20051119-11:24:27')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'967', N'YUYUN', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'968', N'ETI RIYAMAH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'969', N'DIDI ROHIDI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'970', N'WULANDARI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'971', N'NENI KURNIAWATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'972', N'YUYUN YUNIARSIH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'974', N'JAENURI, SE', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'976', N'SUKI WANDOYO, SE.Ak', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'984', N'SULAIMAN', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'985', N'MUHAMAD RODJAK', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'987', N'MARYWATI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'988', N'ELPHI SAHARA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'989', N'SRI RAHAYU FITRI NINGTYAS', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'990', N'SUCI SUHARTI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'992', N'RANI TRESNAYANI', NULL, N'SEKRETARIS', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'997', N'ALIN DARMANTO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'998', N'ROBIN HOT HUTAJULU', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'999', N'SITI AKHIRINA', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1000', N'ERMA SUSANTI WULANDARI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1001', N'JULIA DOKTRINA', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1002', N'INNA SUSANTI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1003', N'NYAI LILIS CHOLISOH', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1004', N'YANTI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1007', N'YUNITA FAJAR CHRISTINA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1008', N'MASIH SUSANTI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1010', N'KANTI DWI HASTUTI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1011', N'ENI DWI HASTUTI                                             ', NULL, N'ANGGREK', N'Edit : DEWI R-20051109-09:41:25')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1012', N'MUCHSIN YUSUF', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1013', N'SESPI MUTIA RAHMADANI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1014', N'AAN SALI', NULL, N'KEUANGAN                                                    ', N'Edit : DIDIKIF-20050930-08:42:55')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1015', N'LILIS HANDAYANI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1021', N'ANDRIANSYAH', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1022', N'MININ', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1023', N'TOFIK', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1024', N'ENDANG AGUSTINAH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1025', N'NATARINA ARIANI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1026', N'SITI RAHMAWATI NAJO', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1027', N'PUJI WIDHI ASTUTI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1031', N'ESTIWIYANI', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1032', N'SYARIFAH AINI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1033', N'INDRA JAYA PERMANA', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1034', N'ANDERSON', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'774', N'DWI MURNI', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050727-11:26:01')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1036', N'CHRISTOPER BUDI UTOMO', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1037', N'IKA SARTIKA', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1038', N'SUTINI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1040', N'MUHAMAD KAHFI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1043', N'KOPERASI (ANDREAN MAULANA)', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1044', N'PANDU PRAMDITHA', NULL, N'APOTEK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1045', N'VITA MELANIA', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1046', N'ESTI PUJI UTAMI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1047', N'FITRIANI MANURUNG', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1048', N'DESI PALUPI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1049', N'ITA SUSANTI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1050', N'YUMINIAR', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1051', N'NUR HAMDANAH', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1052', N'EUIS KARLINAWATI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1053', N'HIKMAH FADILLAH', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1054', N'NOVITA YUSTINE', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1055', N'TOIFAH', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1056', N'HANDANG AKMAL', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1058', N'MELDAWATI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1059', N'WIDI ASTUTI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1060', N'NIKEU PUJIRAHMI', NULL, N'RAWAT INAP', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1061', N'DOKTER TAMU', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1062', N'DOKTER TAMU', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1063', N'DOKTER TAMU', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1064', N'DONI KURNIAWAN', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1065', N'KOPERASI (MATROJI)', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1066', N'KOPERASI (SUMARNO)', NULL, N'', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'408', N'SYAFRUDDIN SURIN, dr.SpJP', NULL, N'POLI JANTUNG', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'286', N'SRI WAHYUNI', NULL, N'POLI MATA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'350', N'JULIANI KUSUMAPUTRA, drg', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'289', N'ECIEN YULIANA', NULL, N'POLI PARU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'148', N'NANIK SETYAWATI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'359', N'SUHADI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'221', N'SUMIYATI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'122', N'WIEKE WIHADANI', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'62', N'SATRIYA ALAM POHAN, dr.SpOG', NULL, N'KAMAR BERSALIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'591', N'Nina Suherlina ', NULL, N'Keperawatan', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'81', N'ENDANG POERWATI, dr.SpA', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'201', N'RR.SITI NURRANI', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'53', N'Fuad Nawawi,dr', NULL, N'Poli Kebidanan', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'468', N'LUCY GARWATI  W, dr.SpAn', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'85', N'EUIS KURNIAWATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'765', N'RIDWAN, dr.SpS', NULL, N'POLI SYARAF', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'70', N'VINNA NANCY HT, dr.SpP', NULL, N'DIREKSI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'343', N'KUSSAMBUDIARTI, dr', NULL, N'POLI KARYAWAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1029', N'Yudi Amiarno,dr', NULL, N'Poli Urologi', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'510', N'WALUYO', NULL, N'PARKIR', N'Baru : DEWI R-20050708-11:45:25')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'898', N'WIDA ISTUTI', NULL, N'SEKRETARIAT KOPERASI', N'Baru : DEWI R-20050708-12:59:38')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'603', N'ODANG', NULL, N'PARKIR', N'Baru : DEWI R-20050708-13:08:04')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'935', N'DR SUBAGYO SP.P', NULL, N'DOKTER', N'Baru : DEWI R-20050708-13:10:16')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'572', N'KURNIA F', NULL, N'KOPERASI', N'Baru : DEWI R-20050708-13:18:00')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'995', N'NURLELA', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050712-13:19:17')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'648', N'NURAHMAN', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050713-09:02:54')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'128', N'BAMBANG SUPRIYANTO', NULL, N'WARTEL', N'Baru : DEWI R-20050713-12:57:58')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'370', N'SIHOL ROBERTO', NULL, N'DAHLIA', N'Baru : DEWI R-20050721-13:52:36')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'676', N'yanis ikhlas', NULL, N'mini market', N'Baru : DEWI R-20050722-09:37:33')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'547', N'slamet haryono', NULL, N'house keeping', N'Baru : DEWI R-20050722-10:16:59')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'783', N'nur karimah', NULL, N'koperasi', N'Baru : DEWI R-20050726-11:51:21')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'569', N'AGAN SUHENDRA', NULL, N'PARKIR', N'Baru : DEWI R-20050727-12:27:48')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'505', N'ALI AKBAR', NULL, N'PARKIR', N'Baru : DEWI R-20050728-11:18:36')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'601', N'PAMUJI', NULL, N'PARKIR', N'Baru : DEWI R-20050728-12:09:57')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'781', N'KOSASIH', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050728-12:58:21')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'993', N'RIDWAN', NULL, N'KOPERASI', N'Baru : KOKO-20050805-16:23:45')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'780', N'IMRON HADI', NULL, N'KOPERASI', N'Baru : DEWI R-20050810-11:00:02')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'526', N'HARYADI WAHYUDI', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050825-12:18:43')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1086', N'SITI TADZKIROH', NULL, N'OPTIK', N'Baru : ANDRI A-20050827-10:44:18')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'921', N'SAHUDI', NULL, N'IGD', N'Baru : DEWI R-20050830-12:14:05')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'785', N'riswoto', NULL, N'koperasi', N'Baru : DEWI R-20050831-12:10:45')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'975', N'suryo s', NULL, N'house keeping', N'Baru : DEWI R-20050919-09:33:19')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'506', N'DIDIK S', NULL, N'PARKIR', N'Edit : DEWI R-20050920-12:33:47')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'672', N'edi purwadi', NULL, N'koperasi', N'Baru : DEWI R-20051011-11:11:22')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1076', N'SYAIFUDIN', NULL, N'AMBULANCE', N'Baru : DEWI R-20051205-11:59:57')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'369', N'RIJADI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'267', N'SRI MURTI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'645', N'dede saefudin', NULL, N'housekeeping', N'Baru : DEWI R-20050726-13:44:02')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'336', N'ABDULAH HASAN, dr.SpB', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'50', N'ABDULLAH BACHMID, dr.SpR', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'80', N'AHMAD HELMI, dr.Sp.OG', NULL, N'MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'44', N'AHMAD HUSNI, drg.MARS', NULL, N'DIREKSI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'930', N'ANGGRINI RUKMI, DRG', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'272', N'AZIZA ARIYANI, dr.SpPK', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'47', N'BAMBANG H SISWITONO, dr.SpAn', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'51', N'BE.CHRISWIYANTI, dr', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'48', N'CHAIDIR AZMAT, dr.SpB', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'388', N'DONNY HAMDANI HAMID, dr.SpS', NULL, N'POLI SYARAF', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'442', N'DONY JANDIANA, dr.SpBO', NULL, N'POLI ORTHOPEDI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'113', N'EKO ARIES SANTO, dr,SpBO', NULL, N'POLI ORTHOPEDI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'362', N'ELLEN R SIANIPAR, dr.SpA', NULL, N'MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'366', N'ENDANG SUMARYATI, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'105', N'ERNA WIDHIYANTI, dr', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'326', N'FAUZIA SABAROEDIN, dr.SpKK', NULL, N'POLI KULIT & KELAMIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'456', N'GAYANTI GERMANIA, dr.SpKK', NULL, N'POLI KULIT & KELAMIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'54', N'HADI S MUKTI SENDJAJA, dr.SpNK', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'280', N'HASNIDAR HASNAN, drg', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'605', N'HENGKINARSO SUBEKTI, dr.SpU', NULL, N'POLI UROLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'434', N'HIDAYAT ANWAR, dr.SpTHT', NULL, N'MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'237', N'HPM. SIANIPAR, dr.SpPD', NULL, N'POLI PENYAKIT DALAM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'57', N'INDRA LENY, dr', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'203', N'ISNAENI EKO, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'270', N'ISNAH HANUM, drg', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'71', N'JULIUS FIRMANSYAH, dr', NULL, N'POLI SYARAF', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'56', N'KRISSUBANU SOSROKUSUMO, dr.SpP', NULL, N'POLI PARU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'59', N'LAKSMI NURHIYANI BT, dr.SpA', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'305', N'LELY HADIATI KIMAN, dr', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'617', N'LENNY SARI, dr.SpPA', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'220', N'PIA DECIMA DWI HASTUTI, dr.SpKK', NULL, N'POLI KULIT & KELAMIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'181', N'ROOSDAHLIA, dr.SpRM', NULL, N'REHAB MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'817', N'SEPHORA, drg', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'539', N'SRI KUSTANTINI HENDRASTUTI, dr', NULL, N'POLI PARU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'432', N'SRI OETAMI, dr.SpM', NULL, N'POLI MATA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'402', N'SRI REDJEKI, dr', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'433', N'SRI SUBIANTARI, dr', NULL, N'POLI MCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'64', N'SUGIONO SETYARAHARDJO, dr', NULL, N'DIREKSI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'346', N'SULASTRI SALIM, dr', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'347', N'SULISTYOWARNI, dr', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'349', N'SUMARINI MARKUM, dr.SpM', NULL, N'POLI MATA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'63', N'SUNARTI BOENAS, dr', NULL, N'PENGEMBANGAN PRODUK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'65', N'SURATNI SURATMAN, dr', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'68', N'TONY PURWANTA, dr', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'69', N'TRI NOVIATI, dr.MARS', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'185', N'YON AHMAD SANTOSA, drg.SpOrt', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'309', N'ZULFA ZAINUDIN, dr', NULL, N'POLI PENYAKIT DALAM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'3', N'ACEP RAHMAT', NULL, N'KAMAR JENAZAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'5', N'ACHMAD YANI SAMALLO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'636', N'ADIANI AYUDI RAHMA, dra.MARS', NULL, N'UMUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'11', N'ARISNA MURNI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'411', N'AWIN', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'20', N'BAMBANG ARDIYANTO', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'19', N'BAMBANG MULDIYATNO, S.Sos, MARS', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'24', N'BURHANUDIN', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'213', N'DAMAYANTI MADURINI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'35', N'DEDDY SURYADI', NULL, N'INFORMASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'72', N'DWI KURNIATI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'73', N'EDY HUTAGALUNG', NULL, N'INFORMASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'79', N'ENDANG SITARUKMI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'82', N'ENIE ROCHAENI, SKM, MARS', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'83', N'ENON HANAN', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'127', N'I MADE SUDIARTA', NULL, N'CSSD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'489', N'IBNU UZAIL YAMANI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'102', N'IDAWATI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'590', N'INDAH SULIANTI, SKM', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'104', N'INDRAYATI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'568', N'JAMDI SANAKY', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'43', N'KHAFIFAH ANY, dra.MARS', NULL, N'DIREKSI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'120', N'KODIR', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'141', N'MUHIDIN', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'143', N'MURDIHARTI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'145', N'MUSNIDIN', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'163', N'NURSUTIATI, S.Sos', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'172', N'PURNAMAWATI, SH', NULL, N'LEGAL SERVICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'173', N'PURWANINGSIH', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'180', N'RINI HARIYATI', NULL, N'PENGEMBANGAN PRODUK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'193', N'SAMBUDI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'190', N'SETIYONO,SIP', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'202', N'SITI RAHAYU', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'348', N'SITI TAMSIAH YULIANTI, DRA', NULL, N'FARMASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'295', N'SRI ASTUTI', NULL, N'MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'204', N'SRI HARTINI', NULL, N'POLI LAKTASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'406', N'SRI IRIANTI', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'206', N'SRI MASRINGAH', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'209', N'SRI SUDHIANINGSIH', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'615', N'SRI SUNDARI', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'214', N'SUHARDIYANTO', NULL, N'SIM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'217', N'SUKARSO', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'218', N'SUKARTIYONO PRI PRABOWO', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'208', N'SULASTRI', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'224', N'SUPRIADI', NULL, N'REKAM MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'15', N'SUSILO HARTONO', NULL, N'GEDUNG & LINGKUNGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'232', N'SUYATNO', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'235', N'SYAHNIAR', NULL, N'KEUANGAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'236', N'SYAWALUDIN', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'238', N'TATY ELIYA', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'246', N'TOKHIDI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'256', N'WINDARTI', NULL, N'LEGAL SERVICE', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'257', N'WIWIT HARYOKO', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'260', N'YOSERIZAL. S.Sos', NULL, N'SDM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'7', N'AGUS SETIAWAN', NULL, N'FARMASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'98', N'AHMAD YANI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'377', N'ASEP YOHANA', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'14', N'ASNAWATY MAHA', NULL, N'PURCHASING & LOGISTIC', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'25', N'BM.EVIE PURNASIH', NULL, N'REHAB MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'437', N'DHIYAN PRIHARTINI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'92', N'GUSRIYANTI', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'95', N'HELENA SITANGGANG', NULL, N'LAUNDRY', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'488', N'HERU SURONO', NULL, N'REHAB MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'441', N'IRA RIVERAWATI, BSc', NULL, N'GIZI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'136', N'IRAWATIDIAH', NULL, N'REHAB MEDIK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'409', N'JUNIARITTA', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'174', N'NENI SUMARYATI', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'183', N'ROSDINA BANGUN', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'247', N'RUKMINI SETYAWATI', NULL, N'FARMASI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'167', N'S.OSCAR SIMAMORA', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'354', N'SITI NURAINI', NULL, N'RADIOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'436', N'TRI HASTUTI', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'253', N'WASNIARTY A', NULL, N'LABORATORIUM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'431', N'YOSAFATI DAELI', NULL, N'POLI GIGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'6', N'AFRIZAL CHANDRA H', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'490', N'AMBUN SURI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'10', N'ANWAR GOZALI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'13', N'ASIH', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'382', N'ASMANETI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'498', N'CHRISTIANA A ERIANI', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'34', N'DARYANTI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'308', N'DEWI ASTUTI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'60', N'DIA AYU MARDIANI', NULL, N'POLI SYARAF', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'296', N'DJUMSIH, SKp', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'74', N'EDIYANTO', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'290', N'EKI MANGGARWATI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'76', N'EMILIANA ADININGTYASWATI, SKp', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'312', N'ENDANG SUSILOWATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'86', N'ENI WAHYUNINGSIH', NULL, N'POLI JANTUNG', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'335', N'ERNA INDRAYANI', NULL, N'POLI JANTUNG', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'84', N'ETY SUPRIYATI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'385', N'EUIS NURASIAH', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'282', N'EVILIA', NULL, N'POLI PENYAKIT DALAM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'88', N'FATIMAH', NULL, N'POLI PENYAKIT DALAM', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'91', N'GUNTUR', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'93', N'HARDAHENI', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'365', N'HENDRA MAULANA', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'99', N'I WAYAN NUARSA', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'106', N'ISANAWATI', NULL, N'POLI KARYAWAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'107', N'ISMET LUBIS', NULL, N'POLI PARU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'314', N'ISMIYATI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'478', N'JONREKDAY SIR', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'342', N'KARNIEL MANIHURUK', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'119', N'KHATARINA LONG', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'288', N'KHOLIS MASITA', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'124', N'LELI SRI SUYETMI', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'125', N'LINDA SAMOSIR', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'66', N'LINDA SUPRIYATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'126', N'MACHALI', NULL, N'POLI UROLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'129', N'MAMAN SURACHMAN', NULL, N'RAWAT JALAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'133', N'MANIH SAMAT', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'132', N'MASDALIFAH', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'327', N'MASLINA SITORUS', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'134', N'MATNAH', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'386', N'MIKE TRILIATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'138', N'MINTARSIH', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'139', N'MOHAMMAD SOLEH', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'387', N'MUNAWAROH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'341', N'NANIK KUSTIATI', NULL, N'POLI KULIT & KELAMIN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'458', N'NENI NURHAERANI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'153', N'NINA HERLINA', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'156', N'NURAINI', NULL, N'POLI JANTUNG', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'158', N'NURHASAN', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'159', N'NURHAYATI SINAGA', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'160', N'NURHELMA', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'161', N'NURLIZAR', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'162', N'NURNANINGSIH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'169', N'PANDE KETUT SURYANINGSIH', NULL, N'RAWAT JALAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'170', N'PANGAPULEN KABAN', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'285', N'PENI BUDI ARSIH', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'316', N'PONSINAH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'404', N'PUDJAWATI FAOZA', NULL, N'POLI THT', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'353', N'PURWANTI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'368', N'PURWANTI', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'317', N'RINAWATI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'182', N'ROLENTI SITANGGANG', NULL, N'TERATAI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'184', N'ROSDIANA SILALAHI', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'287', N'ROSMIATI', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'186', N'RUHYATI', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'191', N'SABAR BIN KARTOSUWIRJO', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'583', N'SANTI', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'339', N'SAPNAH N', NULL, N'MAWAR', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'329', N'SARINAH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'196', N'SITI ALADIAH', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'199', N'SITI HARI INDIYAH', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'319', N'SITI NURJANAH', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'293', N'SRI ASTUTIK', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'419', N'SRI HARDIATI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'320', N'SRI MURNI WIDYANINGSIH', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'207', N'SRI MURTININGSIH', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'276', N'SRI PRALAGUSTI', NULL, N'POLI BEDAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'4', N'SRI SUMARTINI', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'211', N'SRI WAHYU SETIARSIH', NULL, N'ANGGREK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'321', N'SUDIATI', NULL, N'CVCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'323', N'SUGIH HERLINA', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'291', N'SUHAEMI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'492', N'SULASTRI', NULL, N'ICU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'389', N'SULISTYAWATI', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'271', N'SUNARMI, SKp', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'500', N'SUSILO', NULL, N'KEPERAWATAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'228', N'SUTINAH', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'230', N'SUWALI', NULL, N'POLI MCU', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'231', N'SUWARNI', NULL, N'POLI PSIKIATRI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'233', N'SUZANA GULTOM', NULL, N'POLI KEBIDANAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'588', N'SYARIFAH AISYAH', NULL, N'CEMPAKA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'241', N'TITIN FONI KAMSIAH', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'242', N'TIURMA SIPAYUNG', NULL, N'DELIMA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'243', N'TJARWA', NULL, N'KAMAR JENAZAH', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'244', N'TJITJIH JANARSIH', NULL, N'RAWAT JALAN', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'322', N'TRI IMROATUN', NULL, N'PERINATOLOGI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'252', N'WARTI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'294', N'WASIS WIBOWO', NULL, N'MELATI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'497', N'WIWIK PURWANTI', NULL, N'DAHLIA', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'374', N'YANI MEGAWATI', NULL, N'INSTALASI BEDAH SENTRAL', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'650', N'YAYAT SUDRAJAT', NULL, N'IGD', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'324', N'YETI NURJANAH', NULL, N'POLI ANAK', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'261', N'YUS SURSILAH', NULL, N'POLI ORTHOPEDI', NULL)
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'610', N'MASEAH', NULL, N'CVCU', N'Baru : ANDRI A-20050706-11:39:04')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'787', N'SARMILI', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050709-11:22:05')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'519', N'SUHERMAN', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050709-12:53:38')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'508', N'ARIEF RAHMAN', NULL, N'PARKIR', N'Baru : DEWI R-20050718-09:52:47')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'655', N'MARYONO', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050718-13:14:48')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'685', N'ARDIANSYAH', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050721-09:54:35')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'865', N'suhairi', NULL, N'koperasi', N'Baru : DEWI R-20050723-13:00:53')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'684', N'MARDIYAN RACHMAN', NULL, N'HOUSEKEEPING', N'Baru : DEWI R-20050805-13:48:21')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'915', N'arum budiati', NULL, N'sekretariat koperasi', N'Baru : DEWI R-20050810-13:20:56')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1006', N'HANUGRAHINI', NULL, N'sekretariat koperasi', N'Baru : DEWI R-20050811-11:10:04')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1079', N'Puji Lestari-angg', NULL, N'anggrek                                                     ', N'Edit : DEWI R-20051017-10:40:44')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'874', N'markiah effendi', NULL, N'lab', N'Baru : DEWI R-20051018-10:59:51')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'996', N'Juneni', NULL, N'koperasi', N'Baru : DEWI R-20051021-11:33:21')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'966', N'EKA FITRI SUSILANINGTYAS', NULL, N'CEMPAKA', N'Baru : DEWI R-20051021-11:34:19')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'869', N'DEDI M YUSUF', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20051115-12:54:12')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'671', N'ROHILI', NULL, N'TOKO-KOPERASI', N'Baru : DEWI R-20051122-10:38:06')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1017', N'TUBAGUS MUFRENDI', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20051206-11:19:29')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'555', N'ROHMAN', NULL, N'KOPERASI', N'Baru : DEWI R-20050707-12:44:12')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'649', N'M HASAN', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050708-09:32:30')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'507', N'JUNAIDI ABDULLAH', NULL, N'PARKIR', N'Baru : DEWI R-20050712-11:43:13')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'775', N'DWIJO WALUYO', NULL, N'HOUSE KEEPING', N'Baru : DEWI R-20050712-11:51:20')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'771', N'andi mulyana', NULL, N'house keeping', N'Baru : DEWI R-20050720-09:41:55')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'679', N'ALUIH', NULL, N'HOUSE KEEPING', N'Edit : DIDIKIF-20050930-08:43:38')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1042', N'M.ARIEF SETIAWAN,DR.SPPD', NULL, N'dokter', N'Baru : DEWI R-20050803-13:29:11')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1071', N'ARUM WIDYASTUTI', NULL, N'DAHLIA', N'Baru : THE O2IF-20051111-13:43:03')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'1030', N'NUGROHO BUDI S,DR.SPPD', NULL, N'DOKTER', N'Baru : SAM IF-20050813-19:17:34')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'994', N'ACIH SURYANINGSIH', NULL, N'KOPERASI', N'Baru : DEWI R-20050813-19:36:13')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'916', N'SAFITRI E', NULL, N'SEKRETARIAT KOPERASI', N'Baru : DEWI R-20050813-19:41:28')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'620', N'nurainun', NULL, N'cvcu', N'Baru : DEWI R-20050908-12:02:12')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'871', N'AGUNG SUROSO', NULL, N'PARKIR (KOPERASI)', N'Baru : DIDIKIF-20050930-08:42:14')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'779', N'GIMAN SURYAMAN', NULL, N'KOPERASI', N'Baru : DIDIKIF-20051012-08:17:13')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'986', N'MOCH. NUMAN', NULL, N'KOPERASI                                                    ', N'Edit : DEWI R-20050815-10:21:36')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'868', N'TEGUH WICAKSONO', NULL, N'KOPERASI', N'Baru : THE O2IF-20050920-08:43:01')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'979', N'ERFAIDIR', NULL, N'KOPERASI', N'Baru : DEWI R-20051005-01:30:47')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'782', N'NUR HASAN', NULL, N'KOPERASI', N'Baru : DEWI R-20051027-07:16:55')
GO

INSERT INTO [dbo].[TBPEGAWAI] ([ckdpeg], [cnmpeg], [ckdbag], [cnmbag], [cusr_stamp]) VALUES (N'773', N'DIDI SETIAWAN', NULL, N'HOUSEKEEPING', N'Baru : DEWI R-20051209-10:04:49')
GO

COMMIT
GO

