import { FaCat, FaComments } from "react-icons/fa";
import { BiMessageSquareDetail, BiNews, BiSolidCat } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { type AdminProps } from "~/pages/admin";

export default function StatsCard({ counts }: AdminProps) {
  return (
    <div className="flex w-fit flex-col gap-4 rounded-xl bg-white p-6 shadow-lg">
      <h3 className="text-2xl">Stats</h3>
      <div className="flex gap-12">
        <div className="flex flex-col gap-2">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Content
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-2 text-xl">
            <span className="text-blue-500">52</span>
            <div className="flex items-center gap-2">
              <span>Cats</span>
              <FaCat />
            </div>
            <span className="text-blue-500">83</span>
            <div className="flex items-center gap-2">
              <span>Litters</span>
              <BiSolidCat />
            </div>
            <span className="text-blue-500">67</span>
            <div className="flex items-center gap-2">
              <span>Blogposts</span>
            </div>
            <span className="text-blue-500">8</span>
            <div className="flex items-center gap-2">
              <span>Users</span>
              <HiUsers />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Discussions
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-2 text-xl">
            <span className="text-blue-500">15</span>
            <div className="flex items-center gap-2">
              <span>Comments</span>
              <FaComments />
            </div>
            <span className="text-blue-500">7</span>
            <div className="flex items-center gap-2">
              <span>Messages</span>
              <BiMessageSquareDetail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
