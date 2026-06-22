<?php

namespace App\Modules\Procurement\Services\Concerns;

trait InteractsWithRsudPagination
{
  /**
   * @param  list<object>  $rows
   * @param  callable(object): array<string, mixed>  $mapper
   * @return array{rows: list<array<string, mixed>>, summary: array<string, mixed>, meta: array<string, int>}
   */
  protected function paginatedResponse(
    array $rows,
    int $total,
    int $page,
    int $perPage,
    array $summary,
    callable $mapper
  ): array {
    $mapped = array_map($mapper, $rows);
    $from = $total === 0 ? 0 : (($page - 1) * $perPage) + 1;
    $to = min($page * $perPage, $total);

    return [
      'rows' => $mapped,
      'summary' => $summary,
      'meta' => [
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'last_page' => max(1, (int) ceil($total / $perPage)),
        'from' => $from,
        'to' => $to,
      ],
    ];
  }

  protected function formatDate(mixed $value): ?string
  {
    if ($value === null || $value === '') {
      return null;
    }

    try {
      return (new \DateTime((string) $value))->format('Y-m-d');
    } catch (\Throwable) {
      return (string) $value;
    }
  }

  protected function applyBulanFilter(string $column, ?int $bulan, array &$bindings, string &$sql): void
  {
    if ($bulan) {
      $sql .= " AND MONTH({$column}) = ?";
      $bindings[] = $bulan;
    }
  }

  protected function applySearchFilter(array $columns, string $search, array &$bindings, string &$sql): void
  {
    if ($search === '') {
      return;
    }

    $like = '%'.$search.'%';
    $parts = [];
    foreach ($columns as $column) {
      $parts[] = "{$column} LIKE ?";
      $bindings[] = $like;
    }
    $sql .= ' AND ('.implode(' OR ', $parts).')';
  }
}
