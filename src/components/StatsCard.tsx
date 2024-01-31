import { FaCat, FaComments, FaUserFriends } from "react-icons/fa";
import { BiMessageSquareDetail, BiNews, BiSolidCat } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { type AdminProps } from "~/pages/admin";
import { BsImages } from "react-icons/bs";

export default function StatsCard({ counts }: AdminProps) {
  return (
    <div className="flex w-fit flex-col gap-6 rounded-xl bg-white p-6 shadow-lg">
      <h3 className="text-2xl">Stats</h3>
      <div className="flex gap-12 flex-wrap">
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Content
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.catsCount}</span>
            <div className="flex items-center gap-2">
              <span>Cats</span>
              <FaCat />
            </div>
            <span className="text-blue-500">{counts.litterCount}</span>
            <div className="flex items-center gap-2">
              <span>Litters</span>
              <BiSolidCat />
            </div>
            <span className="text-blue-500">{counts.blogCount}</span>
            <div className="flex items-center gap-2">
              <span>Blogposts</span>
              <BiNews />
            </div>
            <span className="text-blue-500">{counts.usersCount}</span>
            <div className="flex items-center gap-2">
              <span>Users</span>
              <HiUsers />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Discussions
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.commentsCount}</span>
            <div className="flex items-center gap-2">
              <span>Comments</span>
              <FaComments />
            </div>
            <span className="text-blue-500">{counts.messageCount}</span>
            <div className="flex items-center gap-2">
              <span>Messages</span>
              <BiMessageSquareDetail />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Photos
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.catImagesCount}</span>
            <div className="flex items-center gap-2">
              <span>Cat images</span>
              <FaCat />
            </div>
            <span className="text-blue-500">{counts.litterImagesCount}</span>
            <div className="flex items-center gap-2">
              <span>Kitten images</span>
              <BiSolidCat />
            </div>
            <span className="text-blue-700">
              {counts.litterImagesCount + counts.catImagesCount}
            </span>
            <div className="flex items-center gap-2">
              <span>Total images</span>
              <BsImages />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <h4 className="w-24 border-b-2 border-dotted border-b-slate-200 text-lg text-gray-600">
            Visitors
          </h4>
          <div className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-3 text-xl">
            <span className="text-blue-500">{counts.visitsCount}</span>
            <div className="flex items-center gap-2">
              <span>Unique visitors</span>
              <FaUserFriends />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
