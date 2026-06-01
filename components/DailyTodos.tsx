'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { api } from '@/lib/api';

import {
  PaginatedResponse,
  DailyTodo,
} from '@/lib/types';

import Loader from './Loader';

import { today } from '@/lib/helpers';


import { DailyTodosForm } from './forms/DailyTodosForm';

import {
  useGlobalApiLoading,
  useMediaQuery,
} from '@/lib/hooks';

import TablePlusFiltersLayout from './TablePlusFilters';

import {
  Column,
  CommonTable,
} from './CommonTable';

import './dashboard/dashboard.css';

import { ListFilter } from 'lucide-react';

const initial = {
  t: '',
};

export const dailyTodosColumns: Column<DailyTodo>[] = [
  {
    key: 't',
    label: 'Task',
    render: (row) => row.t ?? '-',
  },
];

export default function DailyTodos() {

  const [data, setData] =
    useState<DailyTodo[]>([]);

  const [form, setForm] =
    useState(initial);


  const [error, setError] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [
    addDailyTodoModel,
    setAddDailyTodoModel,
  ] = useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [
    openFilterModel,
    setOpenFilterModel,
  ] = useState(false);

  const isApiLoading =
    useGlobalApiLoading();

  const isMobile =
    useMediaQuery(
      '(max-width:768px)'
    );

  const load = useCallback(
    async () => {
      try {

        setPageLoading(true);

const res =
  await api.get<DailyTodo[]>(
    '/todos/dailytodo?limit=200'
  );

setData(res.data);

        setError(null);

      } catch {

        setError(
          'Failed to load daily todos'
        );

      } finally {

        setPageLoading(false);

      }
    },
    []
  );

  const mounted = useRef(false);

  useEffect(() => {

    if (
      mounted.current
    ) return;

    mounted.current =
      true;

    load();

  }, [load]);

const submit = async () => {
  if (!form.t.trim()) {
    alert('Please fill task');
    return;
  }

  try {
    const body = {
      t: form.t.trim(),
    };

    let response;

    if (editingId) {
      response = await api.put(
        `todos/dailytodo/${editingId}`,
        body
      );
    } else {
      response = await api.post(
        'todos/dailytodo',
        body
      );
    }
    if (
      response.status >= 200 &&
      response.status < 300
    ) {
      const latest =
  await api.get<DailyTodo[]>(
    '/todos/dailytodo?limit=200'
  );

      setData(
        latest.data
      );

      setEditingId(null);
      setForm(initial);
      setAddDailyTodoModel(false);
    }
  } catch {
    setError(
      'Failed to save daily todo'
    );
  }
};

const remove = async (
  id: string
) => {
  try {
    const response =
      await api.delete(
        `/todos/dailytodo/${id}`
      );

    if (
      response.status >= 200 &&
      response.status < 300
    ) {
      const latest =
  await api.get<DailyTodo[]>(
    '/todos/dailytodo?limit=200'
  );


      setData(
        latest.data
      );
    }
  } catch {
    setError(
      'Failed to delete daily todo'
    );
  }
};

  const handleEditClick =
    (
      i:DailyTodo
    ) => {

      setEditingId(
        i._id
      );

      setAddDailyTodoModel(
        true
      );

      setForm({
        t:i.t ?? '',
      });
    };

  const handleFormModelClose =
    () => {

      setForm(
        initial
      );

      setEditingId(
        null
      );

      setAddDailyTodoModel(
        false
      );
    };

  const onCancelEdit =
    () => {

      setEditingId(
        null
      );

      setForm(
        initial
      );

      setAddDailyTodoModel(
        false
      );
    };


  if (
    pageLoading
  ) {
    return <Loader />;
  }

  return (
    <div
      className={
        isApiLoading
          ? 'disabled-section'
          : ''
      }
    >

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {isMobile && (

        <div
          style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between',
            gap:10,
            marginTop:16,
          }}
        >

          <button
            className='btn-add'
            onClick={() =>
              setAddDailyTodoModel(
                true
              )
            }
          >
            Add Daily Todo
          </button>

          <ListFilter
            onClick={() =>
              setOpenFilterModel(
                !openFilterModel
              )
            }
          />


        </div>
      )}

      {openFilterModel &&
        isMobile && (

        <div
          className='modal-overlay'
          onClick={() =>
            setOpenFilterModel(
              false
            )
          }
        >

          <div
            className='modal-container'
            onClick={(e)=>
              e.stopPropagation()
            }
          >


          </div>

        </div>
      )}

      {addDailyTodoModel &&
        isMobile && (

        <div
          className='modal-overlay'
          onClick={
            handleFormModelClose
          }
        >

          <div
            className='modal-container'
            onClick={(e)=>
              e.stopPropagation()
            }
          >

            <DailyTodosForm
              form={form}
              setForm={
                setForm
              }
              submit={
                submit
              }
              editingId={
                editingId
              }
              onCancelEdit={
                onCancelEdit
              }
            />

          </div>

        </div>
      )}

      {!isMobile && (

        <DailyTodosForm
          form={form}
          setForm={
            setForm
          }
          submit={
            submit
          }
          editingId={
            editingId
          }
          onCancelEdit={
            onCancelEdit
          }
        />
      )}

      <TablePlusFiltersLayout
        isMobile={
          isMobile
        }
        filtersPanel={null
        }
        tablePanel={

          <CommonTable
            data={data}
            columns={
              dailyTodosColumns
            }
            onDeleteClick={
              remove
            }
            onEditClick={
              handleEditClick
            }
          />

        }
      />

    </div>
  );
}