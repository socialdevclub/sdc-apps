import React, { useEffect } from 'react';
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { PollSchemaWithId } from 'shared~type-poll';
import { css } from '@linaria/core';
import { Query } from '../../hook';
import PollSubTable from './component/PollSubTable';
import PollCreateForm from './component/PollCreateForm';

const columnHelper = createColumnHelper<PollSchemaWithId>();
const columns = [
  {
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: 'pointer' },
          }}
        >
          {row.getIsExpanded() ? '👇' : '👉'}
        </button>
      ) : (
        '🔵'
      );
    },
    header: () => null,
    id: 'expander',
  },
  columnHelper.accessor('title', {
    cell: (v) => v.getValue(),
  }),
  columnHelper.accessor('status', {
    cell: (v) => v.getValue(),
  }),
  columnHelper.accessor('users', {
    cell: (v) => v.getValue().length,
    header: () => '참가자 수',
  }),
  columnHelper.accessor('limitAllCount', {
    cell: (v) => v.getValue(),
  }),
  columnHelper.accessor('limitMaleCount', {
    cell: (v) => v.getValue(),
  }),
  columnHelper.accessor('limitFemaleCount', {
    cell: (v) => v.getValue(),
  }),
  columnHelper.accessor('createdAt', {
    cell: (v) => v.getValue(),
  }),
] as ColumnDef<PollSchemaWithId>[];

const BackofficePoll = () => {
  const { data } = Query.Poll.useQueryPollList();
  console.debug('🚀 ~ file: index.tsx:6 ~ Backoffice ~ data:', data);

  const table = useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
  });

  useEffect(() => {
    table.resetExpanded();
  }, [data, table]);

  if (!data) return <></>;

  return (
    <>
      <PollCreateForm />
      <table
        className={cssTable}
        style={{
          width: table.getCenterTotalSize(),
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={cssTh}
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                  data-f="FT-a81d"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ width: cell.column.getSize() }} data-f="FT-fb92">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    <PollSubTable row={row} key={row.original._id} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
};

const cssTable = css`
  & th {
    text-align: left;
  }
  & th,
  & td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  border: 1px solid #ddd;
  border-collapse: collapse;
  border-spacing: 0;
  width: fit-content;
`;

const cssTh = css`
  padding: 2px 4px;
  position: relative;
  font-weight: bold;
  text-align: center;
  height: 30px;
`;

export default BackofficePoll;
