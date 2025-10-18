namespace TrackingBusSystem.Shared
{
    public class PagedList<T> where T : class

    {
        public IReadOnlyCollection<T> Items { get; private set; }
        public int CurrentPage { get; private set; }
        public int TotalPages { get; private set; }
        public int PageSize { get; private set; }
        public int TotalCount { get; private set; }
        public bool HasPrevious => CurrentPage > 1;
        public bool HasNext => CurrentPage < TotalPages;

        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            TotalCount = count;
            PageSize = pageSize;
            CurrentPage = pageNumber;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            Items = items.AsReadOnly();
        }

        public static PagedList<T> ToPagedList(IQueryable<T> source, int pageNumber, int pageSize)
        {
            int count = source.Count();
            var items = source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList
();
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}
