'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import { api } from '@/lib/api';

import {
  DailyTodo,
} from '@/lib/types';

import Loader from '../common/Loader';



import { DailyTodosForm } from '../forms/DailyTodosForm';

import {
  useGlobalApiLoading,
  useMediaQuery,
} from '@/lib/hooks';

import TablePlusFiltersLayout from '../common/TablePlusFilters';

import {
  Column,
  CommonTable,
} from '../common/CommonTable';

import "../../components/dashboard/dashboard.css"
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
    setError(null);

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
      setError(null);

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
        setError(null);

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


  if (isApiLoading) return <Loader />;


  return (
    <div>

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