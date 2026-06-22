<?php

namespace App\Modules\Finance\Services;

use Illuminate\Support\Collection;

class ExpenditureAjuWorkflowResolver
{
    /** @var list<array{id: string, label: string}> */
    public const TRACKING_STEPS = [
        ['id' => 'pengajuan', 'label' => 'Pengajuan'],
        ['id' => 'negosiasi', 'label' => 'Negosiasi'],
        ['id' => 'surat-pesanan', 'label' => 'Surat Pesanan'],
        ['id' => 'penerimaan-barang', 'label' => 'Penerimaan Barang'],
        ['id' => 'verifikasi-berkas', 'label' => 'Verifikasi Berkas'],
        ['id' => 'rencana-bayar', 'label' => 'Rencana Bayar'],
        ['id' => 'pembayaran', 'label' => 'Pembayaran Berhasil'],
    ];

    /** @var list<string> */
    private const ORDERED_STAGES = [
        'draft',
        'diajukan',
        'menunggu-persetujuan',
        'disetujui',
        'negosiasi',
        'surat-pesanan',
        'penerimaan-barang',
        'verifikasi-berkas',
        'rencana-bayar',
        'pembayaran-berhasil',
    ];

    /**
     * @param  array{
     *   aju_status: string,
     *   latest_aju_flow_status: string|null,
     *   nego_status: string|null,
     *   sppd_status: string|null,
     *   sppu_status: string|null,
     *   sppu_status_bayar: string|null,
     *   sppu_tgl_bayar: string|null
     * }  $ctx
     * @return array{tahap_proses: string, tahap_label: string, tracking: list<array{id: string, label: string, state: string}>}
     */
    public function resolve(array $ctx): array
    {
        $tahap = $this->resolveStage($ctx);
        $tracking = $this->buildTracking($tahap, $ctx);

        return [
            'tahap_proses' => $tahap,
            'tahap_label' => $this->stageLabel($tahap),
            'tracking' => $tracking,
        ];
    }

    /**
     * @param  array<string, mixed>  $ctx
     */
    private function resolveStage(array $ctx): string
    {
        $ajuStatus = strtoupper((string) ($ctx['aju_status'] ?? ''));
        $flowStatus = strtoupper((string) ($ctx['latest_aju_flow_status'] ?? ''));
        $negoStatus = strtoupper((string) ($ctx['nego_status'] ?? ''));
        $sppdStatus = strtoupper((string) ($ctx['sppd_status'] ?? ''));
        $sppuStatus = strtoupper((string) ($ctx['sppu_status'] ?? ''));
        $sppuBayar = trim((string) ($ctx['sppu_status_bayar'] ?? ''));
        $sppuTglBayar = trim((string) ($ctx['sppu_tgl_bayar'] ?? ''));

        if ($ajuStatus === 'BATAL' || $negoStatus === 'CANCELED') {
            return 'dibatalkan';
        }
        if ($ajuStatus === 'REJECT') {
            return 'ditolak';
        }
        if ($ajuStatus === 'CLOSE' || $sppuTglBayar !== '' || strtoupper($sppuBayar) === 'CLOSE') {
            return 'pembayaran-berhasil';
        }
        if ($sppuStatus !== '' || $sppuBayar !== '') {
            return 'rencana-bayar';
        }
        if ($sppdStatus === 'CLOSE') {
            return 'verifikasi-berkas';
        }
        if ($sppdStatus !== '') {
            return 'penerimaan-barang';
        }
        if ($negoStatus === 'ORDERED') {
            return 'surat-pesanan';
        }
        if ($negoStatus === 'VALIDATED') {
            return 'verifikasi-berkas';
        }
        if (in_array($negoStatus, ['DRAFT', 'SUBMITTED'], true)) {
            return 'negosiasi';
        }
        if ($ajuStatus === 'APPROVED') {
            return 'disetujui';
        }
        if ($ajuStatus === 'DRAFT') {
            if ($flowStatus === 'DRAFT' || $flowStatus === '') {
                return 'draft';
            }
            if ($flowStatus === 'SUBMIT') {
                return 'diajukan';
            }
            if ($flowStatus === 'APPROVED') {
                return 'menunggu-persetujuan';
            }
        }

        return 'draft';
    }

    /**
     * @param  array<string, mixed>  $ctx
     * @return list<array{id: string, label: string, state: string}>
     */
    private function buildTracking(string $currentStage, array $ctx): array
    {
        if (in_array($currentStage, ['ditolak', 'dibatalkan'], true)) {
            $terminal = $currentStage === 'ditolak' ? 'rejected' : 'cancelled';

            return array_map(
                fn (array $step) => ['id' => $step['id'], 'label' => $step['label'], 'state' => $terminal],
                self::TRACKING_STEPS
            );
        }

        $stageToStep = [
            'draft' => 'pengajuan',
            'diajukan' => 'pengajuan',
            'menunggu-persetujuan' => 'pengajuan',
            'disetujui' => 'pengajuan',
            'negosiasi' => 'negosiasi',
            'surat-pesanan' => 'surat-pesanan',
            'penerimaan-barang' => 'penerimaan-barang',
            'verifikasi-berkas' => 'verifikasi-berkas',
            'rencana-bayar' => 'rencana-bayar',
            'pembayaran-berhasil' => 'pembayaran',
        ];

        $currentStep = $stageToStep[$currentStage] ?? 'pengajuan';
        $currentIndex = 0;
        foreach (self::TRACKING_STEPS as $i => $step) {
            if ($step['id'] === $currentStep) {
                $currentIndex = $i;
                break;
            }
        }

        $isComplete = $currentStage === 'pembayaran-berhasil';

        return array_map(function (array $step, int $index) use ($currentIndex, $isComplete) {
            if ($isComplete || $index < $currentIndex) {
                return ['id' => $step['id'], 'label' => $step['label'], 'state' => 'done'];
            }
            if ($index === $currentIndex) {
                return ['id' => $step['id'], 'label' => $step['label'], 'state' => 'current'];
            }

            return ['id' => $step['id'], 'label' => $step['label'], 'state' => 'pending'];
        }, self::TRACKING_STEPS, array_keys(self::TRACKING_STEPS));
    }

    private function stageLabel(string $stage): string
    {
        return match ($stage) {
            'draft' => 'Draft',
            'diajukan' => 'Diajukan',
            'menunggu-persetujuan' => 'Menunggu Persetujuan',
            'disetujui' => 'Disetujui',
            'negosiasi' => 'Negosiasi',
            'surat-pesanan' => 'Surat Pesanan',
            'penerimaan-barang' => 'Penerimaan Barang',
            'verifikasi-berkas' => 'Verifikasi Berkas',
            'rencana-bayar' => 'Rencana Bayar',
            'pembayaran-berhasil' => 'Pembayaran Berhasil',
            'ditolak' => 'Ditolak',
            'dibatalkan' => 'Dibatalkan',
            default => 'Draft',
        };
    }

    /** @return list<string> */
    public function stagesForFilter(string $filter): array
    {
        return match ($filter) {
            'draft' => ['draft'],
            'diajukan' => ['diajukan'],
            'menunggu-persetujuan' => ['menunggu-persetujuan'],
            'disetujui' => ['disetujui'],
            'negosiasi' => ['negosiasi'],
            'surat-pesanan' => ['surat-pesanan'],
            'penerimaan-barang' => ['penerimaan-barang'],
            'verifikasi-berkas' => ['verifikasi-berkas'],
            'rencana-bayar' => ['rencana-bayar'],
            'pembayaran-berhasil' => ['pembayaran-berhasil'],
            'ditolak' => ['ditolak'],
            'dibatalkan' => ['dibatalkan'],
            default => [],
        };
    }
}
