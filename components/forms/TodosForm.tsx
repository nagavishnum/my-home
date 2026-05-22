'use client';

export const TodosForm = ({form,setForm,submit,editingId})=> {
    return (
                  <div className="form">
                    <input value={form.t} onChange={(e) => setForm({ ...form, t: e.target.value })} placeholder='Todo'/>
                    <select value={form.p} onChange={(e) => setForm({ ...form, p: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="mandatory">Mandatory</option>
                    </select>
        
                    <input type="date" value={form.da} onChange={(e) => setForm({ ...form, da: e.target.value })} />
        
                    <button className="btn-primary" onClick={submit}>
                      {editingId ? 'Update' : 'Save'}
                    </button>
                  </div>
    )
}