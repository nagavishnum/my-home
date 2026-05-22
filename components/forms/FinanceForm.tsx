'use client';

export const FinanceForm = ({ form, setForm, submit, cats,editingId,setEditingId,set,loading, initial }) => {
    return (
      <div className='form'>
        <input
          placeholder='Name'
          type='text'
          value={form.n}
          onChange={(e) =>
            set('n', e.target.value)
          }
        />

        <input
          placeholder='Total Invested'
          type='number'
          value={form.a}
          onChange={(e) =>
            set('a', e.target.value)
          }
        />

        <select
          value={form.c}
          onChange={(e) =>
            set('c', e.target.value)
          }
        >
          <option value=''>
            Category
          </option>

          {cats.map((i) => (
            <option
              key={i._id}
              value={i._id}
            >
              {i.n}
            </option>
          ))}
        </select>

        <select
          value={form.ty}
          onChange={(e) =>
            set('ty', e.target.value)
          }
        >
          <option value='Monthly'>
            Monthly
          </option>

          <option value='OneTime'>
            One Time
          </option>
        </select>
{
  form.ty === 'Monthly' && (
    <input
      placeholder='Monthly SIP Amount'
      type='number'
      value={form.sv}
      onChange={(e) =>
        set(
          'sv',
          e.target.value
        )
      }
    />
  )
}
        <input
          type='date'
          value={form.md}
          onChange={(e) =>
            set('md', e.target.value)
          }
        />

        <input
          placeholder='Lock Period (years)'
          type='number'
          value={form.lp}
          onChange={(e) =>
            set('lp', e.target.value)
          }
        />

        <input
          placeholder='Returns %'
          type='number'
          value={form.rt}
          onChange={(e) =>
            set('rt', e.target.value)
          }
        />

        <input
          placeholder='Current Value'
          type='number'
          value={form.cv}
          onChange={(e) =>
            set('cv', e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submit();
            }
          }}
        />

        <input
          placeholder='Notes'
          type='text'
          value={form.no}
          onChange={(e) =>
            set('no', e.target.value)
          }
        />

        <button
          className='btn-primary'
          onClick={submit}
          disabled={loading}
        >
          {editingId
            ? 'Update'
            : 'Save'}
        </button>



        {editingId && (
          <button
            className='btn-secondary'
            onClick={() => {
              setEditingId(null);

              setForm(initial);
            }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    )
}