import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllDanhMuc, getAllDanhMucCha, type DanhMuc, type DanhMucCha } from '../../services/danhMucService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { BookOpen, ChevronRight, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

const UserDanhMuc = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [categoryParents, setCategoryParents] = useState<DanhMucCha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, parentsData] = await Promise.all([
        getAllDanhMuc(),
        getAllDanhMucCha()
      ]);
      setCategories(categoriesData);
      setCategoryParents(parentsData);
    } catch (err: unknown) {
      console.error('Error loading categories:', err);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = selectedParent
    ? categories.filter(cat => cat.danh_muc_cha_id === selectedParent)
    : categories;

  const groupedCategories = categoryParents.map(parent => ({
    parent,
    children: categories.filter(cat => cat.danh_muc_cha_id === parent.danh_muc_cha_id)
  }));

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/books?category=${categoryId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadData}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-400 text-white mb-4">
            <FolderTree className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Danh mục sách
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập sách đa dạng được phân loại theo từng danh mục
          </p>
        </div>

        {/* Filter by Parent Category */}
        {categoryParents.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedParent === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedParent(null)}
                className="mb-2"
              >
                Tất cả
              </Button>
              {categoryParents.map((parent) => (
                <Button
                  key={parent.danh_muc_cha_id}
                  variant={selectedParent === parent.danh_muc_cha_id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedParent(parent.danh_muc_cha_id)}
                  className="mb-2"
                >
                  {parent.ten_danh_muc_cha}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <>
            {/* Grouped by Parent */}
            {selectedParent === null && groupedCategories.length > 0 ? (
              <div className="space-y-8">
                {groupedCategories.map(({ parent, children }) => (
                  <div key={parent.danh_muc_cha_id} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {parent.ten_danh_muc_cha}
                      </h2>
                      {parent.mo_ta && (
                        <p className="text-sm text-gray-500">({parent.mo_ta})</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {children.map((category) => (
                        <Card
                          key={category.danh_muc_id}
                          className="hover:shadow-md transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-300 bg-white dark:bg-slate-900"
                          onClick={() => handleCategoryClick(category.danh_muc_id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {category.danhmuccha && (
                                  <Badge variant="outline" className="text-xs mb-2 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                                    {category.danhmuccha.ten_danh_muc_cha}
                                  </Badge>
                                )}
                                <CardTitle className="text-lg mb-2 text-gray-900 dark:text-gray-100 font-bold">
                                  {category.ten_danh_muc}
                                </CardTitle>
                                {category.mo_ta && (
                                  <CardDescription className="line-clamp-2 text-gray-700 dark:text-gray-300">
                                    {category.mo_ta}
                                  </CardDescription>
                                )}
                              </div>
                              <BookOpen className="h-6 w-6 text-blue-500 shrink-0 ml-2" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs text-gray-800 dark:text-gray-200">
                                  {category.slug}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(category.danh_muc_id);
                                  }}
                                >
                                  Xem sách
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* All Categories Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Card
                    key={category.danh_muc_id}
                    className="hover:shadow-md transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-300 bg-white dark:bg-slate-900"
                    onClick={() => handleCategoryClick(category.danh_muc_id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 text-gray-900 dark:text-gray-100 font-bold">
                            {category.ten_danh_muc}
                          </CardTitle>
                          {category.danhmuccha && (
                            <Badge variant="outline" className="text-xs mb-2 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                              {category.danhmuccha.ten_danh_muc_cha}
                            </Badge>
                          )}
                          {category.mo_ta && (
                            <CardDescription className="line-clamp-2 text-gray-700 dark:text-gray-300">
                              {category.mo_ta}
                            </CardDescription>
                          )}
                        </div>
                        <BookOpen className="h-6 w-6 text-blue-600 shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.danhmuccha && (
                          <Badge variant="outline" className="text-xs text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                            {category.danhmuccha.ten_danh_muc_cha}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs text-gray-800 dark:text-gray-200">
                            {category.slug}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(category.danh_muc_id);
                            }}
                          >
                            Xem sách
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Không có danh mục nào</h3>
            <p className="text-gray-500">Hiện tại chưa có danh mục sách trong hệ thống</p>
          </div>
        )}

        {/* Back to Books */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/books">
              Xem tất cả sách
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDanhMuc;

