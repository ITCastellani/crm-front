import api from '@/lib/axios';

export const getOpportunities = async () => {
  try {
    // Esto llamará a http://localhost:3010/api/opportunities
    const { data } = await api.get('/opportunities');
    return data; 
  } catch (error: any) {
    console.error("Error al traer oportunidades:", error);
    throw new Error(error.response?.data?.message || "No se pudieron cargar las oportunidades");
  }
};

export const updateOpportunityStatus = async (id: string, newStatus: string) => {
  try {
    // Esto llamará a http://localhost:3010/api/opportunities/:id
    const { data } = await api.put(`/opportunities/${id}`, { 
      status: newStatus 
    });
    return data;
  } catch (error: any) {
    console.error("Error al actualizar el estado:", error);
    throw new Error(
      error.response?.data?.message || "Error al actualizar la oportunidad"
    );
  }
};