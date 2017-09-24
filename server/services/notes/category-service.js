import CategoryApi from '../../models/notes/category';
export const getAvailableCategoryKey = () => {
  return CategoryApi.find({ isActive: true })
    .select('key');
};
