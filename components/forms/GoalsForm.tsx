'use client';

export const GoalsForm = ({form,set,cats,isFinance,submit,editingId})=> {
    return (
    <div className='form'>
        <input
          placeholder='Title'
          value={form.t}
          onChange={(e) =>
            set('t', e.target.value)
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

        <input
          placeholder='Description'
          value={form.d}
          onChange={(e) =>
            set('d', e.target.value)
          }
        />

        <input
          type='date'
          value={form.td}
          onChange={(e) =>
            set('td', e.target.value)
          }
        />

        <select
          value={form.p}
          onChange={(e) =>
            set('p', e.target.value)
          }
        >
          <option value='low'>
            Low
          </option>

          <option value='medium'>
            Medium
          </option>

          <option value='high'>
            High
          </option>
        </select>

        <select
          value={form.s}
          onChange={(e) =>
            set('s', e.target.value)
          }
        >
          <option value='pending'>
            Pending
          </option>

          <option value='inprogress'>
            In Progress
          </option>

          <option value='completed'>
            Completed
          </option>
        </select>

        {isFinance && (
          <>
            <input
              placeholder='Target Value'
              type='number'
              value={form.tv}
              onChange={(e) =>
                set(
                  'tv',
                  e.target.value
                )
              }
            />

            <input
              placeholder='Current Value'
              type='number'
              value={form.cv}
              onChange={(e) =>
                set(
                  'cv',
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submit();
                }
              }}
            />
          </>
        )}

        <button
          className='btn-primary'
          onClick={submit}
        >
          {editingId
            ? 'Update'
            : 'Save'}
        </button>
      </div>
    )
}